use std::{collections::HashMap, sync::Arc};

use bevy_ecs::prelude::*;
use dashmap::DashMap;
use futures::future::join_all;
use parking_lot::Mutex;
use wtransport::SendStream;

/// the world def
#[derive(Debug)]
pub struct World {
    pub bevy_world: bevy_ecs::world::World,
    pub config: crate::config::config::Config,
}
pub type MWorld = Arc<Mutex<World>>;

type IDToSender = DashMap<u8, Arc<Mutex<SendStream>>>;
impl World {
    // TODO: discard client if failed to send. i hate people with bad internet.
    pub async fn send_to(id: u8, packet: bytes::Bytes, streams: &IDToSender) {
        if let Some(stream) = streams.get_mut(&id) {
            if let Err(e) = stream.try_lock().unwrap().write_all(&packet).await {
                tracing::warn!("failed to send packets to {}: {}", id, e);
            }
        }
    }

    pub async fn broadcast(packet: bytes::Bytes, streams: &IDToSender) {
        let futures = streams.iter().map(|entry| {
            let stream = entry.value().clone();
            let data = packet.clone();

            async move {
                let mut lock = stream.lock();
                let _ = lock.write_all(&data).await;
            }
        });

        join_all(futures).await;
    }

    pub async fn broadcast_with_exceptions(exceptions: &[u8], packet: &[u8], streams: &IDToSender) {
        let mut futures = vec![];

        for entry in streams.iter() {
            if exceptions.contains(entry.key()) {
                continue;
            }

            let stream = entry.value().clone();

            futures.push(async move {
                let mut lock = stream.lock();
                let _ = lock.write_all(&packet).await;
            });
        };

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
