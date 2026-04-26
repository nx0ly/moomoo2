use std::sync::Arc;

use borsh_derive::{BorshDeserialize, BorshSerialize};
use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};
use hkdf::Hkdf;
use parking_lot::Mutex;
use pqc_kyber::{KYBER_PUBLICKEYBYTES, KYBER_SSBYTES};
use rand_core::OsRng;
use sha2::Sha256;
use wtransport::{RecvStream, SendStream};
use x25519_dalek::{EphemeralSecret, PublicKey};

mod handle_conn;
pub mod serialization;
pub use handle_conn::handle_conn;
mod handle_msgs;

#[macro_export]
/// Macro that combined several broadcast functions.
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
/// Struct that represents the initial server-sent public key.
/// Contains the x25519 public key and the kyber public key.
struct ClientHello {
    x25519_pk: [u8; 32],
    kyber_pk:  Vec<u8>,
}

#[derive(BorshSerialize, BorshDeserialize)]
/// Struct that represents the initial client-sent msg.
/// Contains the x25519 public key and the kyber ciphertext.
struct ServerHello {
    x25519_pk: [u8; 32],
    kyber_ct:  Vec<u8>,
}

#[derive(Clone)]
pub struct SessionCrypto {
    pub cipher:     Arc<ChaCha20Poly1305>,
    pub send_nonce: Arc<Mutex<u64>>,
}

impl SessionCrypto {
    /// Initializes a new SessionCrypto, takes the key as argument.
    pub fn new(key: [u8; 32]) -> Self {
        let key = Key::from_slice(&key);
        Self {
            cipher:     Arc::new(ChaCha20Poly1305::new(key)),
            send_nonce: Arc::new(Mutex::new(0)),
        }
    }

    /// Nonces are used because ChaCha20-Poly1305 is a stream cipher.
    /// That is, if you encrypt 2 different messages with the same key + nonce
    /// pair, attackers can XOR the 2 ciphertexts together, leaking info.
    pub fn make_nonce(counter: u64) -> Nonce {
        // ChaCha20-Poly1305 requires a 12 byte nonce.
        let mut bytes = [0u8; 12];

        // Counter is u64, which is 8 bytes.
        bytes[4..].copy_from_slice(&counter.to_be_bytes());

        // Format:
        // [0, 0, 0, 0, XX, XX, XX, XX, XX, XX, XX, XX]

        // Wraps the bytes into the type the lib expects.
        // Dereferences to return the value.
        *Nonce::from_slice(&bytes)
    }

    /// Returns [ nonce(8) | ciphertext ]
    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        // Update nonce counter.
        let mut counter = self.send_nonce.lock();
        let nonce_value = *counter;
        *counter = counter.wrapping_add(1);
        drop(counter);

        let nonce = Self::make_nonce(nonce_value);
        let ciphertext = self.cipher.encrypt(&nonce, plaintext)?;

        // Create the packet, insert both the nonce and the ciphertext.
        let mut packet = Vec::with_capacity(8 + ciphertext.len());
        packet.extend_from_slice(&nonce_value.to_be_bytes());
        packet.extend(ciphertext);

        // Return it, handle possible 'None' variant elsewhere.
        Ok(packet)
    }

    pub fn decrypt_datagram(&self, datagram: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        // If the data is too small, it cannot be a valid message.
        if datagram.len() < 24 {
            return Err(chacha20poly1305::Error);
        }

        // Split into the nonce and the ciphertext.
        let (nonce_bytes, ciphertext) = datagram.split_at(8);

        // Extract nonce.
        let nonce_value = u64::from_be_bytes(nonce_bytes.try_into().unwrap());
        let nonce = Self::make_nonce(nonce_value);

        // Decrypt.
        self.cipher.decrypt(&nonce, ciphertext)
    }

    pub fn send_nonce(&self) -> u64 {
        *self.send_nonce.lock()
    }
}

/// Heart of the cryptography system.
/// Performs a hybrid post-quantum handshake with the client.
/// The server generates an Ephemeral key (one time use), and we derive a public
/// key from it. Client does the same, we get their public key through
/// 'ClientHello'. In other words: combines x25519 and kyber.
// TODO: remove dependency on 'anyhow' to 'thiserror', more structured errors.
pub async fn perform_handshake(send: &mut SendStream, recv: &mut RecvStream) -> anyhow::Result<SessionCrypto> {
    // Create the key.
    let server_secret = EphemeralSecret::random_from_rng(OsRng);
    // Derive a public key.
    let server_public = PublicKey::from(&server_secret);

    // Messages are length-prefixed: first 4 bytes tell us how many bytes to read
    // next. This is necessary because streams have no built-in message
    // boundaries.
    let mut len_buf = [0u8; 4];
    recv.read_exact(&mut len_buf).await?;

    // Reads the remaining msg based on the length.
    // Same buffer idea as before.
    let msg_len = u32::from_be_bytes(len_buf) as usize;
    let mut buf = vec![0u8; msg_len];
    recv.read_exact(&mut buf).await?;

    // Reconstruct the ClientHello msg (that's what we expect).
    let client_hello: ClientHello = borsh::from_slice(&buf)?;

    // Reconstruct the client's x25519 public key from the raw bytes they sent.
    let client_x25519_pk = PublicKey::from(client_hello.x25519_pk);

    // This is where the DH (Diffie Hellman) occurs.
    // To concisely explain it: it's easy to combine but hard to reverse.
    // We get their part of the "puzzle" and we construct it with our secret.
    // The client does something similar, such that we both arrive to the same
    // secret. The benefit is that we never directly send the secret over the
    // network.
    let x25519_shared_secret = server_secret.diffie_hellman(&client_x25519_pk);

    // Check if valid size.
    if client_hello.kyber_pk.len() != KYBER_PUBLICKEYBYTES {
        return Err(anyhow::anyhow!("invalid kyber public key size"));
    }

    // 'encapsulate' does 2 things.
    // It generates a random shared secret, and it encrypts that secret using the
    // client's public key.
    let (kyber_ciphertext, kyber_shared_secret) = pqc_kyber::encapsulate(&client_hello.kyber_pk, &mut OsRng).unwrap();

    // We combine both x25519 and Kyber.
    // Why? Because Kyber is still relatively new, it could contain some
    // undiscovered vulnerabilities. By combining x25519 and Kyber, we get a
    // little more security. x25519 by itself however, could be cracked via
    // quantum computers.
    let mut combined_secret = Vec::with_capacity(32 + KYBER_SSBYTES);
    combined_secret.extend_from_slice(x25519_shared_secret.as_bytes());
    combined_secret.extend_from_slice(&kyber_shared_secret);

    // We use HKDF (HMAC-based Key Derivation Function) to combine the secrets.
    // It also:
    // - Takes the raw combined secret, and hashes it into a uniformly random value.
    // - It expands to fill the necessary bytes.

    // The key "mumu" is temporary. It will be moved later.
    // TODO: move the "mumu" key to the config file. And make errors better.
    let hkdf = Hkdf::<Sha256>::new(None, &combined_secret);

    // This is the ChaCha20-Poly1305 session key.
    let mut session_key = [0u8; 32];

    hkdf.expand(b"mumu", &mut session_key)
        .map_err(|_| anyhow::anyhow!("hkdf expansion failed"))?;

    // Construct the ServerHello.
    let server_hello = ServerHello {
        x25519_pk: *server_public.as_bytes(),
        kyber_ct:  kyber_ciphertext.to_vec(),
    };

    // We send it to the client.
    let response_bytes = borsh::to_vec(&server_hello)?;
    let len_bytes = (response_bytes.len() as u32).to_be_bytes();
    send.write_all(&len_bytes).await?;
    send.write_all(&response_bytes).await?;

    tracing::info!("handshake complete - session encrypted");

    // Return a SessionCrypto instance with the session key.
    Ok(SessionCrypto::new(session_key))
}
