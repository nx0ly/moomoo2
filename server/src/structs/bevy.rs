use crate::SessionCrypto;
use bevy_ecs::prelude::*;
use bytes::Bytes;
use chacha20poly1305::aead::Aead;
use dashmap::DashMap;
use futures::future::join_all;
use parking_lot::Mutex;
use std::{collections::HashMap, sync::Arc};
use tokio::sync::Mutex as AsyncMutex;
use wtransport::Connection;

pub struct PlayerConnection {
    pub connection: Connection,
    pub crypto: SessionCrypto,
}

impl PlayerConnection {
    pub fn new(connection: Connection, crypto: SessionCrypto) -> Self {
        Self { connection, crypto }
    }

    // pub async fn send_encrypted(
    //     &mut self,
    //     plaintext: &[u8],
    // ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    //     let ciphertext = self
    //         .crypto
    //         .encrypt(plaintext)
    //         .map_err(|e| format!("encrypt failed: {e}"))?;

    //     let len_bytes = (ciphertext.len() as u32).to_be_bytes();
    //     self.stream.write_all(&len_bytes).await?;
    //     self.stream.write_all(&ciphertext).await?;
    //     Ok(())
    // }
    //
    pub async fn send_encrypted(
        &self,
        plaintext: &[u8],
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let mut counter = self.crypto.send_nonce.lock();
        let nonce_value = *counter;
        *counter = counter.wrapping_add(1);
        drop(counter);

        let nonce = SessionCrypto::make_nonce(nonce_value);

        let ciphertext = self
            .crypto
            .cipher
            .encrypt(&nonce, plaintext)
            .map_err(|e| format!("encrypt failed: {e}"))?;

        let mut packet = nonce_value.to_be_bytes().to_vec();
        packet.extend(ciphertext);

        self.connection
            .send_datagram(Bytes::from(packet))
            .map_err(|e| format!("send_datagram failed: {e}"))?;

        Ok(())
    }

    pub async fn send_reliable(
        &self,
        plaintext: &[u8],
    ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
        let packet = {
            let mut counter = self.crypto.send_nonce.lock();
            let nonce_value = *counter;
            *counter = counter.wrapping_add(1);
            // guard drops here at end of block

            let nonce = SessionCrypto::make_nonce(nonce_value);
            let ciphertext = self
                .crypto
                .cipher
                .encrypt(&nonce, plaintext)
                .map_err(|e| format!("encrypt failed: {e}"))?;

            let mut p = nonce_value.to_be_bytes().to_vec();
            p.extend(ciphertext);
            p
        };

        let mut stream = self.connection.open_uni().await?.await?;

        let len_bytes = (packet.len() as u32).to_be_bytes();
        stream.write_all(&len_bytes).await?;
        stream.write_all(&packet).await?;
        stream.finish().await?;

        Ok(())
    }
}

#[derive(Debug)]
pub struct World {
    pub bevy_world: bevy_ecs::world::World,
    pub config: crate::config::config::Config,
}
pub type MWorld = Arc<Mutex<World>>;

pub type IDToConnection = Arc<DashMap<u8, Arc<AsyncMutex<PlayerConnection>>>>;

impl World {
    pub async fn send_to(id: u8, plaintext: &[u8], connections: &IDToConnection) {
        if let Some(conn_ref) = connections.get(&id) {
            let conn = conn_ref.clone();
            let data = Bytes::copy_from_slice(plaintext);
            // let mut conn = conn_ref.lock().await;
            // if let Err(e) = conn.send_encrypted(plaintext).await {
            //     tracing::warn!("failed to send packet to player {}: {}", id, e);
            // }

            tokio::spawn(async move {
                let _ = conn.lock().await.send_encrypted(&data).await;
            });
        }
    }

    pub async fn broadcast(plaintext: &[u8], connections: &IDToConnection) {
        let futures = connections.iter().map(|entry| {
            let conn = entry.value().clone();
            let data = Bytes::copy_from_slice(plaintext);

            async move {
                let lock = conn.lock().await;
                let _ = lock.send_encrypted(&data).await;
            }
        });

        join_all(futures).await;
    }

    pub async fn broadcast_with_exceptions(
        exceptions: &[u8],
        plaintext: &[u8],
        connections: &IDToConnection,
    ) {
        let futures = connections
            .iter()
            .filter(|entry| !exceptions.contains(entry.key()))
            .map(|entry| {
                let conn = entry.value().clone();
                let data = Bytes::copy_from_slice(plaintext);

                async move {
                    let mut lock = conn.lock().await;
                    let _ = lock.send_encrypted(&data).await;
                }
            });

        join_all(futures).await;
    }

    pub async fn send_reliable_to(id: u8, plaintext: &[u8], connections: &IDToConnection) {
        if let Some(conn_ref) = connections.get(&id) {
            let lock = conn_ref.lock().await;
            if let Err(e) = lock.send_reliable(plaintext).await {
                tracing::error!("Reliable send failed for player {}: {}", id, e);
            }
        }
    }

    pub async fn broadcast_reliable(plaintext: &[u8], connections: &IDToConnection) {
        let futures = connections.iter().map(|entry| {
            let conn = entry.value().clone();
            let data = plaintext.to_vec();
            async move {
                let lock = conn.lock().await;
                let _ = lock.send_reliable(&data).await;
            }
        });
        join_all(futures).await;
    }
}

#[derive(Debug, Resource)]
pub struct PlayerMap {
    pub map: HashMap<u8, Entity>,
}

impl Default for PlayerMap {
    fn default() -> Self {
        Self {
            map: HashMap::new(),
        }
    }
}
