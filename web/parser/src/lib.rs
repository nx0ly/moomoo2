use serde::Serialize;
use shared::to_client::{AddPlayerData, ClientMessages, MapChunkData, UpdatePlayerData};
use shared::{
    PacketType,
    structs::client::{JsMove, JsPlayer},
    structs::server::Move,
    to_server::SpawnMessage,
};
use wasm_bindgen::prelude::*;

use borsh_derive::{BorshDeserialize, BorshSerialize};
use chacha20poly1305::{
    ChaCha20Poly1305, Key, Nonce,
    aead::{Aead, KeyInit},
};
use hkdf::Hkdf;
use pqc_kyber::{
    KYBER_CIPHERTEXTBYTES, KYBER_PUBLICKEYBYTES, KYBER_SECRETKEYBYTES, decapsulate, keypair,
};
use sha2::Sha256;
use x25519_dalek::{PublicKey, StaticSecret};

#[derive(BorshSerialize, BorshDeserialize)]
struct ClientHello {
    x25519_pk: [u8; 32],
    kyber_pk: Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
struct ServerHello {
    x25519_pk: [u8; 32],
    kyber_ct: Vec<u8>,
}

#[wasm_bindgen]
pub struct SessionCrypto {
    cipher: ChaCha20Poly1305,
    send_nonce: u64,
    recv_nonce: u64,
}

#[wasm_bindgen]
impl SessionCrypto {
    fn make_nonce(counter: u64) -> Nonce {
        let mut bytes = [0u8; 12];
        bytes[4..].copy_from_slice(&counter.to_be_bytes());
        *Nonce::from_slice(&bytes)
    }

    #[wasm_bindgen]
    pub fn encrypt(&mut self, plaintext: &[u8]) -> Result<Vec<u8>, JsValue> {
        let nonce = Self::make_nonce(self.send_nonce);
        self.send_nonce = self.send_nonce.wrapping_add(1);

        self.cipher
            .encrypt(&nonce, plaintext)
            .map_err(|e| JsValue::from_str(&format!("encryption failed: {}", e)))
    }

    #[wasm_bindgen]
    pub fn decrypt(&mut self, ciphertext: &[u8]) -> Result<Vec<u8>, JsValue> {
        let nonce = Self::make_nonce(self.recv_nonce);

        let plaintext = self.cipher.decrypt(&nonce, ciphertext).map_err(|e| JsValue::from_str(&format!("decryption failed: {}", e)));

        self.recv_nonce = self.recv_nonce.wrapping_add(1);
        plaintext
    }

    // debug stuff
    #[wasm_bindgen]
    pub fn get_send_nonce(&self) -> u64 {
        self.send_nonce
    }

    #[wasm_bindgen]
    pub fn get_recv_nonce(&self) -> u64 {
        self.recv_nonce
    }
}

#[wasm_bindgen]
pub struct HandshakeState {
    x25519_secret: Vec<u8>,
    kyber_secret: Vec<u8>,
}

#[wasm_bindgen]
impl HandshakeState {
    #[wasm_bindgen]
    pub fn create_client_hello() -> Result<HandshakeStateAndMessage, JsValue> {
        let mut rng = rand_core::OsRng;

        let x25519_secret = StaticSecret::random_from_rng(rng);
        let x25519_public = PublicKey::from(&x25519_secret);

        let keys = keypair(&mut rng)
            .map_err(|e| JsValue::from_str(&format!("kyber keygen failed: {:?}", e)))?;

        if keys.public.len() != KYBER_PUBLICKEYBYTES {
            return Err(JsValue::from_str("invalid kyber public key size"));
        }
        if keys.secret.len() != KYBER_SECRETKEYBYTES {
            return Err(JsValue::from_str("invalid kyber secret key size"));
        }

        let client_hello = ClientHello {
            x25519_pk: *x25519_public.as_bytes(),
            kyber_pk: keys.public.to_vec(),
        };

        let serialized = borsh::to_vec(&client_hello)
            .map_err(|e| JsValue::from_str(&format!("serialization failed: {}", e)))?;

        let state = HandshakeState {
            x25519_secret: x25519_secret.to_bytes().to_vec(),
            kyber_secret: keys.secret.to_vec(),
        };

        Ok(HandshakeStateAndMessage {
            state,
            message: serialized,
        })
    }

    #[wasm_bindgen]
    pub fn complete_handshake(self, server_hello_bytes: &[u8]) -> Result<SessionCrypto, JsValue> {
        let server_hello: ServerHello = borsh::from_slice(server_hello_bytes)
            .map_err(|e| JsValue::from_str(&format!("failed to parse ServerHello: {}", e)))?;

        if server_hello.kyber_ct.len() != KYBER_CIPHERTEXTBYTES {
            return Err(JsValue::from_str(&format!(
                "invalid kyber ciphertext size: expected {}, got {}",
                KYBER_CIPHERTEXTBYTES,
                server_hello.kyber_ct.len()
            )));
        }

        let x25519_secret_bytes: [u8; 32] = self
            .x25519_secret
            .try_into()
            .map_err(|_| JsValue::from_str("invalid x25519 secret key length"))?;
        let x25519_secret = StaticSecret::from(x25519_secret_bytes);

        // x25519 ecdh
        let server_x25519_pk = PublicKey::from(server_hello.x25519_pk);
        let x25519_shared = x25519_secret.diffie_hellman(&server_x25519_pk);

        let kyber_shared = decapsulate(&server_hello.kyber_ct, &self.kyber_secret)
            .map_err(|e| JsValue::from_str(&format!("kyber decapsulation failed: {:?}", e)))?;

        let mut combined_secret = Vec::with_capacity(32 + kyber_shared.len());
        combined_secret.extend_from_slice(x25519_shared.as_bytes());
        combined_secret.extend_from_slice(&kyber_shared);

        let hkdf = Hkdf::<Sha256>::new(None, &combined_secret);
        let mut session_key = [0u8; 32];
        hkdf.expand(b"mumu", &mut session_key)
            .map_err(|_| JsValue::from_str("hkdf expansion failed"))?;

        let key = Key::from_slice(&session_key);
        let cipher = ChaCha20Poly1305::new(key);

        Ok(SessionCrypto {
            cipher,
            send_nonce: 0,
            recv_nonce: 0,
        })
    }
}

#[wasm_bindgen]
pub struct HandshakeStateAndMessage {
    state: HandshakeState,
    message: Vec<u8>,
}

#[wasm_bindgen]
impl HandshakeStateAndMessage {
    #[wasm_bindgen]
    pub fn message(&self) -> Vec<u8> {
        self.message.clone()
    }

    #[wasm_bindgen]
    pub fn complete_handshake(self, server_hello_bytes: &[u8]) -> Result<SessionCrypto, JsValue> {
        self.state.complete_handshake(server_hello_bytes)
    }
}

#[derive(Serialize)]
struct DecodedPacket<T> {
    code: u8,
    data: T,
}

#[wasm_bindgen]
pub fn decode_bytes(bytes: &[u8]) -> Result<JsValue, JsValue> {
    if bytes.is_empty() {
        return Err(JsValue::from_str("empty"));
    }

    let opcode = bytes.first();

    match opcode {
        Some(code) => match PacketType::from_u8(*code) {
            Some(PacketType::Spawn) => {
                let data = borsh::from_slice::<ClientMessages>(&bytes[1..])
                    .map_err(|e| JsValue::from_str(&format!("error decoding player {}", e)))?;

                let data = match data {
                    ClientMessages::AddPlayer(d) => d,
                };

                let packet = DecodedPacket { code: *code, data };

                Ok(serde_wasm_bindgen::to_value(&packet)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?)
            }
            Some(PacketType::Move) => {
                let data = borsh::from_slice::<Move>(&bytes[1..])
                    .map_err(|e| JsValue::from_str(&format!("error decoding move {}", e)))?;
                let packet = DecodedPacket { code: *code, data };

                Ok(serde_wasm_bindgen::to_value(&packet)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?)
            }
            Some(PacketType::UpdatePlayers) => {
                let data = borsh::from_slice::<UpdatePlayerData>(&bytes[1..]).map_err(|e| JsValue::from_str(&format!("error decoding updateplayers {}", e)))?;
                let packet = DecodedPacket {code: *code, data};

                                Ok(serde_wasm_bindgen::to_value(&packet)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?)

            }
            Some(PacketType::MapData) => {
            let data = borsh::from_slice::<MapChunkData>(&bytes[1..])
                .map_err(|e| JsValue::from_str(&format!("error decoding map chunk {}", e)))?;
            let packet = DecodedPacket { code: *code, data };

            Ok(serde_wasm_bindgen::to_value(&packet)
                .map_err(|e| JsValue::from_str(&e.to_string()))?)
        }
            None => Err(JsValue::from_str("unknown opcode")),
        },
        None => Err(JsValue::from_str("no opcode found")),
    }
}

#[wasm_bindgen]
pub fn encode_into_bytes(packet: JsValue, opcode: u8) -> Result<Box<[u8]>, JsValue> {
    let mut buf = vec![opcode];

    match opcode {
        1 => {
            let spawn: SpawnMessage = serde_wasm_bindgen::from_value(packet)
                .map_err(|x| JsValue::from_str(&x.to_string()))?;
            if let Err(e) = borsh::to_writer(&mut buf, &spawn) {
                return Err(JsValue::from_str(&format!(
                    "error encoding spawn msg {}",
                    e
                )));
            }
        }
        2 => {
            let js_move: JsMove = serde_wasm_bindgen::from_value(packet)
                .map_err(|x| JsValue::from_str(&x.to_string()))?;
            if let Err(e) = borsh::to_writer(&mut buf, &js_move) {
                return Err(JsValue::from_str(&format!("error encoding move {}", e)));
            }
        }
        _ => return Err(JsValue::from_str("unknown opcode")),
    }

    Ok(buf.into_boxed_slice())
}
