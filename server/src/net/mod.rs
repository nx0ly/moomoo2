use borsh_derive::{BorshDeserialize, BorshSerialize};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};

use dashmap::DashMap;
use hkdf::Hkdf;
use parking_lot::Mutex;
use pqc_kyber::{KYBER_PUBLICKEYBYTES, KYBER_SSBYTES};
use rand_core::OsRng;
use sha2::Sha256;
use shared::structs::server::Player;
use std::sync::Arc;
use wtransport::{RecvStream, SendStream};
use x25519_dalek::{EphemeralSecret, PublicKey};

use crate::{errors::InternalGameMessages, structs::bevy::IDToConnection};

mod handle_conn;
pub mod serialization;
pub use handle_conn::handle_conn;
mod handle_msgs;

#[macro_export]
macro_rules! broadcast {
    ($rt:expr, $connections:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let msg = $msg;
        $rt.spawn(async move {
            World::broadcast(&msg, &connections).await;
        });
    }};
    (reliable, $rt:expr, $connections:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let msg = $msg;
        $rt.spawn(async move {
            World::broadcast_reliable(&msg, &connections).await;
        });
    }};
    (to, $rt:expr, $connections:expr, $id:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let msg = $msg;
        let id = $id;
        $rt.spawn(async move {
            World::send_to(id, &msg, &connections).await;
        });
    }};
    (reliable_to, $rt:expr, $connections:expr, $id:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let msg = $msg;
        let id = $id;
        $rt.spawn(async move {
            World::send_reliable_to(id, &msg, &connections).await;
        });
    }};
    (except, $rt:expr, $connections:expr, $exceptions:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let msg = $msg;
        let exceptions = $exceptions;
        $rt.spawn(async move {
            World::broadcast_with_exceptions(&exceptions, &msg, &connections).await;
        });
    }};
    (nearby, $rt:expr, $connections:expr, $positions:expr, $origin:expr, $radius:expr, $msg:expr) => {{
        let connections = $connections.clone();
        let positions = $positions.clone();
        let msg = $msg;
        let origin = $origin;
        $rt.spawn(async move {
            World::broadcast_nearby(&msg, &connections, &positions, origin, $radius);
        });
    }};
}

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
#[derive(Clone)]
pub struct SessionCrypto {
    pub cipher: Arc<ChaCha20Poly1305>,
    pub send_nonce: Arc<Mutex<u64>>,
}

impl SessionCrypto {
    pub fn new(key: [u8; 32]) -> Self {
        let key = Key::from_slice(&key);
        Self {
            cipher: Arc::new(ChaCha20Poly1305::new(key)),
            send_nonce: Arc::new(Mutex::new(0)),
        }
    }

    pub fn make_nonce(counter: u64) -> Nonce {
        let mut bytes = [0u8; 12];
        bytes[4..].copy_from_slice(&counter.to_be_bytes());
        *Nonce::from_slice(&bytes)
    }

    // returns [ nonce(8) | ciphertext ]
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        let mut counter = self.send_nonce.lock();
        let nonce_value = *counter;
        *counter = counter.wrapping_add(1);
        drop(counter);

        let nonce = Self::make_nonce(nonce_value);
        let ciphertext = self.cipher.encrypt(&nonce, plaintext)?;

        let mut packet = Vec::with_capacity(8 + ciphertext.len());
        packet.extend_from_slice(&nonce_value.to_be_bytes());
        packet.extend(ciphertext);
        Ok(packet)
    }

    pub fn decrypt_datagram(&self, datagram: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        if datagram.len() < 24 {
            return Err(chacha20poly1305::Error);
        }
        let (nonce_bytes, ciphertext) = datagram.split_at(8);
        let nonce_value = u64::from_be_bytes(nonce_bytes.try_into().unwrap());
        let nonce = Self::make_nonce(nonce_value);
        self.cipher.decrypt(&nonce, ciphertext)
    }

    pub fn send_nonce(&self) -> u64 {
        *self.send_nonce.lock()
    }
}

pub async fn perform_handshake(
    send: &mut SendStream,
    recv: &mut RecvStream,
) -> anyhow::Result<SessionCrypto> {
    let server_secret = EphemeralSecret::random_from_rng(OsRng);
    let server_public = PublicKey::from(&server_secret);

    let mut len_buf = [0u8; 4];
    recv.read_exact(&mut len_buf).await?;
    let msg_len = u32::from_be_bytes(len_buf) as usize;
    let mut buf = vec![0u8; msg_len];
    recv.read_exact(&mut buf).await?;
    let client_hello: ClientHello = borsh::from_slice(&buf)?;

    let client_x25519_pk = PublicKey::from(client_hello.x25519_pk);
    let x25519_shared_secret = server_secret.diffie_hellman(&client_x25519_pk);

    if client_hello.kyber_pk.len() != KYBER_PUBLICKEYBYTES {
        return Err(anyhow::anyhow!("invalid kyber public key size"));
    }

    let (kyber_ciphertext, kyber_shared_secret) =
        pqc_kyber::encapsulate(&client_hello.kyber_pk, &mut OsRng).unwrap();

    let mut combined_secret = Vec::with_capacity(32 + KYBER_SSBYTES);
    combined_secret.extend_from_slice(x25519_shared_secret.as_bytes());
    combined_secret.extend_from_slice(&kyber_shared_secret);

    let hkdf = Hkdf::<Sha256>::new(None, &combined_secret);
    let mut session_key = [0u8; 32];
    hkdf.expand(b"mumu", &mut session_key)
        .map_err(|_| anyhow::anyhow!("hkdf expansion failed"))?;

    let server_hello = ServerHello {
        x25519_pk: *server_public.as_bytes(),
        kyber_ct: kyber_ciphertext.to_vec(),
    };
    let response_bytes = borsh::to_vec(&server_hello)?;
    let len_bytes = (response_bytes.len() as u32).to_be_bytes();
    send.write_all(&len_bytes).await?;
    send.write_all(&response_bytes).await?;
    tracing::info!("handshake complete - session encrypted");

    Ok(SessionCrypto::new(session_key))
}

struct PlayerSession {
    id: u8,
    connections: IDToConnection,
    players: Arc<DashMap<u8, Player>>,
    tx: tokio::sync::mpsc::Sender<(u8, InternalGameMessages)>,
}

impl Drop for PlayerSession {
    fn drop(&mut self) {
        self.connections.remove(&self.id);
        self.players.remove(&self.id);
        let _ = self
            .tx
            .try_send((self.id, InternalGameMessages::Disconnect));
    }
}
