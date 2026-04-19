use crate::{
    broadcast,
    errors::InternalGameMessages,
    net::SessionCrypto,
    structs::components::{
        AimDir, AnimalType, AttackState, Health, HitEvents, MoveDir, Name, ObjectEntity,
        PlayerBundle, PlayerEntity, PlayerPositions, Position, ReloadState, Resources, Velocity,
    },
    systems::NonReactiveCollider,
};
use bevy_ecs::prelude::*;
use bytes::Bytes;
use chacha20poly1305::aead::Aead;
use dashmap::DashMap;
use parking_lot::Mutex;
use shared::{
    to_client::{
        AddAnimalData, AnimalTO, HitEventTO, ObjectHitAnimData, ObjectTO, PlayerTO,
        SetResourceData, SetWeaponsData, UpdatePlayerData,
    },
    to_server::ClientMessages,
};
use std::{
    collections::HashMap,
    sync::{
        atomic::{AtomicBool, AtomicU32, AtomicU64},
        Arc,
    },
    time::Duration,
};
use wtransport::Connection;

#[derive(Clone)]
pub struct PlayerConnection {
    pub connection: Connection,
    pub crypto: SessionCrypto,
    pub bytes_sent: Arc<AtomicU64>,
    pub bytes_recv: Arc<AtomicU64>,
}

impl PlayerConnection {
    pub fn new(connection: Connection, crypto: SessionCrypto) -> Self {
        Self {
            connection,
            crypto,
            bytes_sent: Arc::new(AtomicU64::new(0)),
            bytes_recv: Arc::new(AtomicU64::new(0)),
        }
    }

    // pub async fn send_encrypted(
    //     &mut self,
    //     plaintext: &[u8],
    // ) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    //     let ciphertext = self
    //         .cryptod
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

        self.bytes_sent
            .fetch_add(packet.len() as u64, std::sync::atomic::Ordering::Relaxed);

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

        self.bytes_sent
            .fetch_add(packet.len() as u64, std::sync::atomic::Ordering::Relaxed);

        let mut stream = self.connection.open_uni().await?.await?;

        let len_bytes = (packet.len() as u32).to_be_bytes();
        stream.write_all(&len_bytes).await?;
        stream.write_all(&packet).await?;
        stream.finish().await?;

        Ok(())
    }
}

pub struct World {
    pub bevy_world: bevy_ecs::world::World,
    pub config: crate::config::config::Config,
    pub schedule: bevy_ecs::schedule::Schedule,
}
pub type MWorld = Arc<Mutex<World>>;

pub type IDToConnection = Arc<DashMap<u8, PlayerConnection>>;

impl World {
    pub async fn broadcast(plaintext: &[u8], connections: &IDToConnection) {
        let conns: Vec<PlayerConnection> = connections.iter().map(|e| e.value().clone()).collect();

        for conn in conns {
            let data = Bytes::copy_from_slice(plaintext);
            tokio::spawn(async move {
                let _ = conn.send_encrypted(&data).await;
            });
        }
    }

    pub async fn broadcast_with_exceptions(
        exceptions: &[u8],
        plaintext: &[u8],
        connections: &IDToConnection,
    ) {
        let conns: Vec<PlayerConnection> = connections
            .iter()
            .filter(|e| !exceptions.contains(e.key()))
            .map(|e| e.value().clone())
            .collect();

        for conn in conns {
            let data = Bytes::copy_from_slice(plaintext);
            tokio::spawn(async move {
                let _ = conn.send_encrypted(&data).await;
            });
        }
    }

    pub async fn broadcast_reliable(plaintext: &[u8], connections: &IDToConnection) {
        let conns: Vec<PlayerConnection> = connections.iter().map(|e| e.value().clone()).collect();

        for conn in conns {
            let data = plaintext.to_vec();
            tokio::spawn(async move {
                let _ = conn.send_reliable(&data).await;
            });
        }
    }

    pub async fn send_reliable_to(id: u8, plaintext: &[u8], connections: &IDToConnection) {
        if let Some(conn) = connections.get(&id).map(|e| e.value().clone()) {
            let data = plaintext.to_vec();
            tokio::spawn(async move {
                if let Err(e) = conn.send_reliable(&data).await {
                    tracing::error!("reliable send failed for player {}: {}", id, e);
                }
            });
        }
    }

    pub async fn send_to(id: u8, plaintext: &[u8], connections: &IDToConnection) {
        if let Some(conn) = connections.get(&id).map(|e| e.value().clone()) {
            let data = Bytes::copy_from_slice(plaintext);
            tokio::spawn(async move {
                let _ = conn.send_encrypted(&data).await;
            });
        }
    }

    pub fn broadcast_nearby(
        plaintext: &[u8],
        connections: &IDToConnection,
        positions: &std::collections::HashMap<u8, (f32, f32)>,
        origin: (f32, f32),
        radius: f32,
    ) {
        let radius_sq = radius * radius;
        let conns: Vec<(u8, PlayerConnection)> = connections
            .iter()
            .filter(|e| {
                if let Some(&(px, py)) = positions.get(e.key()) {
                    let dx = px - origin.0;
                    let dy = py - origin.1;
                    dx * dx + dy * dy <= radius_sq
                } else {
                    false
                }
            })
            .map(|e| (*e.key(), e.value().clone()))
            .collect();

        for (_, conn) in conns {
            let data = Bytes::copy_from_slice(plaintext);
            tokio::spawn(async move {
                let _ = conn.send_encrypted(&data).await;
            });
        }
    }

    fn handle_internal_game_msgs(
        &mut self,
        msg: InternalGameMessages,
        input_map: &InputMap,
        id: u8,
        player_connections: &IDToConnection,
        rt_handle: &tokio::runtime::Handle,
    ) {
        let bevy = &mut self.bevy_world;
        match msg {
            InternalGameMessages::AddPlayer(p) => {
                input_map.insert(id, PlayerInput::new());

                // tell the new player about all existing players
                let entities: Vec<(u8, Entity)> = {
                    let player_map = bevy.resource::<PlayerMap>();
                    player_map.map.iter().map(|e| (*e.0, *e.1)).collect()
                };

                let player_connections_1 = player_connections.clone();

                for (existing_id, entity) in entities {
                    if let (Some(name), Some(pos), Some(aim)) = (
                        bevy.get::<Name>(entity),
                        bevy.get::<Position>(entity),
                        bevy.get::<AimDir>(entity),
                    ) {
                        let msg = crate::net::serialization::encode(
                            1,
                            ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                                is_mine: false,
                                data: PlayerTO {
                                    id: existing_id,
                                    name: name.0.clone(),
                                    x: pos.0,
                                    y: pos.1,
                                    aim: aim.0,
                                    weapon_index: Some(0),
                                },
                            }),
                        )
                        .unwrap();

                        broadcast!(to, rt_handle, player_connections, id, msg);
                    }
                }

                {
                    let mut objects = Vec::new();
                    for entity in bevy
                        .query::<(
                            Entity,
                            &ObjectEntity,
                            &Position,
                            &AimDir,
                            &Health,
                            &Resources,
                            &Collider,
                            &NonReactiveCollider,
                        )>()
                        .iter(&bevy)
                    {
                        let a = ObjectTO {
                            id: entity.0.index(),
                            x: entity.2 .0,
                            y: entity.2 .1,
                            scale: entity.6.rad,
                        };

                        objects.push(a);
                    }

                    let msg = crate::net::serialization::encode(
                        7,
                        ClientMessages::AddObject(shared::to_client::AddObjectData { objects }),
                    )
                    .unwrap();

                    broadcast!(reliable_to, rt_handle, player_connections, id, msg);
                }

                // spawn the new player entity
                use crate::systems::{Collider, ReactiveCollider};
                let entity = bevy
                    .spawn(PlayerBundle(
                        PlayerEntity,
                        Name(p.name.clone()),
                        Position(p.x, p.y),
                        Velocity(p.vx, p.vy),
                        MoveDir(None),
                        AimDir(0.0),
                        crate::structs::weapons::Weapon::Fists,
                        ReloadState(0, 300),
                        Health(100., 100.),
                        AttackState(false),
                        Resources(100, 100, 100, 100, 0),
                        Collider::circle(35.),
                        ReactiveCollider,
                    ))
                    .id();
                bevy.resource_mut::<PlayerMap>().map.insert(id, entity);

                // tell the new player about themselves
                let spawn_self = crate::net::serialization::encode(
                    1,
                    ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                        is_mine: true,
                        data: PlayerTO {
                            id,
                            name: p.name.clone(),
                            x: p.x,
                            y: p.y,
                            aim: 0.0,
                            weapon_index: Some(0),
                        },
                    }),
                )
                .unwrap();

                let set_weapons =
                    crate::net::serialization::encode(9, SetWeaponsData { weapons: vec![0] })
                        .unwrap();

                broadcast!(reliable_to, rt_handle, player_connections_1, id, spawn_self);
                broadcast!(
                    reliable_to,
                    rt_handle,
                    player_connections_1,
                    id,
                    set_weapons
                );

                // tell all existing players about the new player
                let spawn_other = crate::net::serialization::encode(
                    1,
                    ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                        is_mine: false,
                        data: PlayerTO {
                            id,
                            name: p.name.clone(),
                            x: p.x,
                            y: p.y,
                            aim: 0.0,
                            weapon_index: Some(0),
                        },
                    }),
                )
                .unwrap();

                broadcast!(except, rt_handle, player_connections, [id], spawn_other);
            }
            InternalGameMessages::Disconnect => {
                input_map.remove(&id);

                if let Some(e) = bevy.resource_mut::<PlayerMap>().map.remove(&id) {
                    if let Some(p) = bevy.get::<Name>(e) {
                        tracing::info!("player {} ({}) gone", p.0, id);
                    }
                    bevy.despawn(e);
                }
            }
            InternalGameMessages::PlayerHit(_) => {
                if let Some(&e) = bevy.resource::<PlayerMap>().map.get(&id) {
                    if let Some(mut hit) = bevy.get_mut::<AttackState>(e) {
                        hit.0 = !hit.0;
                    }
                }
            }
            _ => {}
        }
    }

    fn broadcast_state(
        &mut self,
        rt_handle: &tokio::runtime::Handle,
        player_connections: &IDToConnection,
    ) {
        let bevy = &mut self.bevy_world;

        let pos_updates: Vec<(u8, (f32, f32))> = {
            let player_map = bevy.resource::<PlayerMap>();
            player_map
                .map
                .iter()
                .filter_map(|(id, &entity)| {
                    bevy.get::<Position>(entity)
                        .map(|pos| (*id, (pos.0, pos.1)))
                })
                .collect()
        };

        let mut pos_cache = bevy.resource_mut::<PlayerPositions>();
        pos_cache.0.clear();
        for (id, pos) in pos_updates {
            pos_cache.0.insert(id, pos);
        }

        // here
        let positions = bevy.resource::<PlayerPositions>().0.clone();
        let hits = std::mem::take(&mut bevy.resource_mut::<HitEvents>().0);

        if !hits.is_empty() {
            // build reverse map: Entity -> player_id
            let player_map = bevy.resource::<PlayerMap>();
            let entity_to_id: std::collections::HashMap<Entity, u8> =
                player_map.map.iter().map(|e| (*e.1, *e.0)).collect();

            for hit in hits {
                let origin = (hit.attacker_pos.0, hit.attacker_pos.1);

                if let Some(&player_id) = entity_to_id.get(&hit.attacker) {
                    let msg = crate::net::serialization::encode(
                        6,
                        HitEventTO {
                            entity_id: player_id,
                        },
                    )
                    .unwrap();

                    broadcast!(
                        nearby,
                        rt_handle,
                        player_connections,
                        positions,
                        origin,
                        2048.0,
                        msg
                    );
                }

                for (obj_entity, angle) in hit.object_hits {
                    let msg = crate::net::serialization::encode(
                        10,
                        ObjectHitAnimData {
                            id: obj_entity.index(),
                            dir: angle,
                        },
                    )
                    .unwrap();
                    broadcast!(
                        nearby,
                        rt_handle,
                        player_connections,
                        positions,
                        origin,
                        2048.0,
                        msg
                    );
                }

                if let Some(&player_id) = entity_to_id.get(&hit.attacker) {
                    if let Some(&entity) = bevy.resource::<PlayerMap>().map.get(&player_id) {
                        if let Some(res) = bevy.get::<Resources>(entity) {
                            let msg = crate::net::serialization::encode(
                                11,
                                SetResourceData {
                                    wood: res.0,
                                    stone: res.1,
                                    food: res.2,
                                },
                            )
                            .unwrap();

                            broadcast!(to, rt_handle, player_connections, player_id, msg);
                        }
                    }
                }
            }
        }

        let player_map = bevy.resource::<PlayerMap>();
        let mut updates = Vec::new();
        for (i, &entity) in player_map.map.iter() {
            if let (Some(name), Some(pos), Some(aim)) = (
                bevy.get::<Name>(entity),
                bevy.get::<Position>(entity),
                bevy.get::<AimDir>(entity),
            ) {
                updates.push(PlayerTO {
                    id: *i,
                    name: name.0.clone(),
                    x: pos.0,
                    y: pos.1,
                    aim: aim.0,
                    weapon_index: Some(0),
                });
            }
        }

        let mut animal_updates = Vec::new();
        let mut animal_query = bevy.query::<(Entity, &Position, &AnimalType)>();
        let iterator = animal_query.iter(&self.bevy_world);
        for (entity, pos, _type) in iterator {
            animal_updates.push(AnimalTO {
                id: entity.index(),
                x: pos.0,
                y: pos.1,
                animal_type: *_type as u8,
            })
        }

        if !updates.is_empty() {
            let update_msg =
                crate::net::serialization::encode(3, UpdatePlayerData { players: updates })
                    .unwrap();

            broadcast!(rt_handle, player_connections, update_msg);
        }

        if !animal_updates.is_empty() {
            let update_msg = crate::net::serialization::encode(
                4,
                AddAnimalData {
                    animals: animal_updates,
                },
            )
            .unwrap();

            broadcast!(reliable, rt_handle, player_connections, update_msg);
        }
    }

    pub fn run(
        world: Arc<Mutex<World>>,
        mut input_rx: tokio::sync::mpsc::Receiver<(u8, InternalGameMessages)>,
        input_map: InputMap,
        player_connections: IDToConnection,
        rt_handle: tokio::runtime::Handle,
    ) {
        let tick = Duration::from_millis(67);
        loop {
            let start = std::time::Instant::now();

            {
                let mut w = world.lock();
                while let Ok((id, msg)) = input_rx.try_recv() {
                    w.handle_internal_game_msgs(
                        msg,
                        &input_map,
                        id,
                        &player_connections,
                        &rt_handle,
                    );
                }

                {
                    // let bevy = &mut w.bevy_world;
                    let World { 
        ref mut bevy_world, 
        ref mut schedule, 
        .. 
    } = *w;

                    for entry in input_map.iter() {
                        let id = *entry.key();
                        if let Some(&entity) = bevy_world.resource::<PlayerMap>().map.get(&id) {
                            if let Some(mut md) = bevy_world.get_mut::<MoveDir>(entity) {
                                md.0 = entry.get_move();
                            }
                            if let Some(mut ad) = bevy_world.get_mut::<AimDir>(entity) {
                                ad.0 = entry.get_aim();
                            }
                        }
                    }

                    schedule.run(bevy_world);

                    w.broadcast_state(&rt_handle, &player_connections);
                }
            }

            if let Some(remaining) = tick.checked_sub(start.elapsed()) {
                std::thread::sleep(remaining);
            }
        }
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

pub struct PlayerInput {
    pub move_dir: AtomicU32,
    pub aim_dir: AtomicU32,

    pub has_move: AtomicBool,
}

use std::sync::atomic::Ordering;
impl PlayerInput {
    pub fn new() -> Self {
        Self {
            has_move: AtomicBool::new(false),
            move_dir: AtomicU32::new(0),
            aim_dir: AtomicU32::new(0),
        }
    }
    pub fn set_move(&self, dir: Option<f32>) {
        self.has_move.store(dir.is_some(), Ordering::Relaxed);
        self.move_dir
            .store(dir.unwrap_or(0.0).to_bits(), Ordering::Relaxed);
    }
    pub fn set_aim(&self, dir: f32) {
        self.aim_dir.store(dir.to_bits(), Ordering::Relaxed);
    }
    pub fn get_move(&self) -> Option<f32> {
        self.has_move
            .load(Ordering::Relaxed)
            .then(|| f32::from_bits(self.move_dir.load(Ordering::Relaxed)))
    }
    pub fn get_aim(&self) -> f32 {
        f32::from_bits(self.aim_dir.load(Ordering::Relaxed))
    }
}

pub type InputMap = Arc<DashMap<u8, PlayerInput>>;
