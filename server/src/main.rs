use std::{
    sync::{atomic::AtomicU8, Arc},
    time::Duration,
};

use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};

#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
struct CollisionSet;

use rand_core::OsRng;
use sha2::Sha256;
use x25519_dalek::{EphemeralSecret, PublicKey};

use bevy_ecs::{prelude::*, schedule::ScheduleBuildSettings};
use dashmap::DashMap;
use parking_lot::Mutex;
use shared::{
    structs::server::HitEvent as sharedHitEvent,
    to_client::ObjectTO,
    to_server::{AimMessage, MoveMessage, SpawnMessage},
};
use shared::{
    structs::server::Player,
    to_client::{AddAnimalData, AnimalTO},
};
use shared::{to_client::HitEventTO, PacketType};
use shared::{
    to_client::{PlayerTO, UpdatePlayerData},
    to_server::{ClientMessages, HitMessage},
};
use tokio::sync::mpsc as god;
use tokio::sync::Mutex as AsyncMutex;
use wtransport::*;

use hkdf::Hkdf;
use pqc_kyber::{KYBER_PUBLICKEYBYTES, KYBER_SSBYTES};

use nanorand::{Rng, WyRand};

use crate::{
    config::config::{load_config, Config},
    errors::{GameError, InternalGameMessages},
    structs::{
        bevy::{IDToConnection, PlayerConnection, PlayerMap, World},
        components::{
            AiState, AiTarget, AimDir, AnimalEntity, AnimalType, AttackState, Health, HitEvents,
            MoveDir, Name, ObjectEntity, PlayerBundle, PlayerEntity, Position, ReloadState,
            Resources, Velocity,
        },
    },
    systems::{init_map, GlobalRng, NonReactiveCollider},
};

mod config;
mod errors;
mod structs;
mod systems;

use borsh_derive::{BorshDeserialize, BorshSerialize};

pub static CONFIG: once_cell::sync::Lazy<Config> =
    once_cell::sync::Lazy::new(|| load_config().expect("Failed to load config"));

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
    cipher: Arc<ChaCha20Poly1305>,
    send_nonce: Arc<Mutex<u64>>,
}

impl SessionCrypto {
    fn new(key: [u8; 32]) -> Self {
        let key = Key::from_slice(&key);
        Self {
            cipher: Arc::new(ChaCha20Poly1305::new(key)),
            send_nonce: Arc::new(Mutex::new(0)),
        }
    }

    fn make_nonce(counter: u64) -> Nonce {
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

async fn perform_handshake(
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    let config = load_config().expect("failed to load config");

    let world = Arc::new(Mutex::new(World {
        bevy_world: bevy_ecs::world::World::new(),
        config,
    }));

    {
        use crate::structs::components::Position;
        use crate::systems::{Collider, NonReactiveCollider};

        let mut w = world.lock();
        let mut rng = GlobalRng(WyRand::new());

        init_map(&mut w.bevy_world, &mut rng);

        w.bevy_world.insert_resource(PlayerMap::default());
        w.bevy_world.insert_resource(rng);
        w.bevy_world.insert_resource(HitEvents::default());

        // w.bevy_world
        //     .insert_resource(crate::systems::BoidsCache::new(8162));
        //
        // FOR TESTING!
        // initialize 2000 fish
        let mut rng = WyRand::new();

        let min_x = CONFIG.map.ocean_start_x as f32;
        let max_x = CONFIG.map.ocean_end_x as f32;
        let min_y = 0.0;
        let max_y = CONFIG.map.size as f32;

        for _ in 0..(2_i32.pow(12)) {
            let x = min_x + (rng.generate::<f32>() * (max_x - min_x));
            let y = min_y + (rng.generate::<f32>() * (max_y - min_y));

            w.bevy_world.spawn((
                Position(x, y),
                Velocity(
                    (rng.generate::<f32>() - 0.5) * 50.0,
                    (rng.generate::<f32>() - 0.5) * 50.0,
                ),
                AiState::Wander,
                AiTarget(
                    None,
                    x + (rng.generate::<f32>() - 0.5) * 100.0,
                    y + (rng.generate::<f32>() - 0.5) * 100.0,
                ),
                AnimalType::Fish,
                AnimalEntity,
                Collider::circle(35.0),
                NonReactiveCollider,
            ));
        }
        // initialize wall boundary colliders

        w.bevy_world.spawn((
            Position(8192., 0.),
            Collider::rect(8192., 67.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position(8192., 16384.),
            Collider::rect(8192., 67.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position(0., 8192.),
            Collider::rect(67., 8192.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position(16384., 8192.),
            Collider::rect(67., 8192.),
            NonReactiveCollider,
        ));
    }

    let player_connections: IDToConnection = Arc::new(DashMap::new());
    type LatestMoveDir = Arc<DashMap<u8, Option<f32>>>;
    type LatestAimDir = Arc<DashMap<u8, f32>>;

    let latest_move: LatestMoveDir = Arc::new(DashMap::new());
    let latest_aim: LatestAimDir = Arc::new(DashMap::new());

    let (input_tx, mut input_rx) = god::channel::<(u8, InternalGameMessages)>(1024);

    let identity = Identity::load_pemfiles("cert.pem", "key.pem").await?;
    let server_config = ServerConfig::builder()
        .with_bind_default(6767)
        .with_identity(identity)
        .build();

    let server = Endpoint::server(server_config)?;
    tracing::info!("server listening on port 6767");

    let next_id = AtomicU8::new(0);

    tokio::spawn({
        let connections = player_connections.clone();
        let tx = input_tx.clone();

        let latest_move = latest_move.clone();
        let latest_aim = latest_aim.clone();

        async move {
            loop {
                let incoming_session = match server.accept().await.await {
                    Ok(s) => s,
                    Err(e) => {
                        tracing::error!("failed to accept session: {}", e);
                        continue;
                    }
                };

                let player_id = next_id.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
                let conn_map = connections.clone();
                let game_tx = tx.clone();

                let latest_move = latest_move.clone();
                let latest_aim = latest_aim.clone();
                tokio::spawn(async move {
                    let connection = match incoming_session.accept().await {
                        Ok(c) => c,
                        Err(e) => {
                            tracing::error!("failed to accept connection: {}", e);
                            return;
                        }
                    };

                    let (mut send_stream, mut recv_stream) = match connection.accept_bi().await {
                        Ok(s) => s,
                        Err(e) => {
                            tracing::error!("failed to open bidirectional stream: {}", e);
                            return;
                        }
                    };

                    let crypto = match perform_handshake(&mut send_stream, &mut recv_stream).await {
                        Ok(c) => c,
                        Err(e) => {
                            tracing::error!("handshake failed for player {}: {}", player_id, e);
                            let _ = connection.close(VarInt::from_u32(1), b"handshake_failed");
                            return;
                        }
                    };

                    // drop streams after handshake
                    drop(send_stream);
                    drop(recv_stream);

                    conn_map.insert(
                        player_id,
                        Arc::new(AsyncMutex::new(PlayerConnection::new(
                            connection.clone(),
                            crypto.clone(),
                        ))),
                    );
                    tracing::info!("player {} connected - session encrypted", player_id);

                    let _session_guard = PlayerSession {
                        id: player_id,
                        connections: conn_map.clone(),
                        players: Arc::new(DashMap::new()),
                        tx: game_tx.clone(),
                    };

                    loop {
                        let datagram = match connection.receive_datagram().await {
                            Ok(d) => d,
                            Err(e) => {
                                tracing::info!("player {} disconnected: {}", player_id, e);
                                break;
                            }
                        };

                        if datagram.len() < 8 {
                            continue;
                        }
                        let (nonce_bytes, _) = datagram.split_at(8);
                        let nonce_value = u64::from_be_bytes(nonce_bytes.try_into().unwrap());
                        // let nonce = SessionCrypto::make_nonce(nonce_value);

                        // reaches into the struct internals directly, bypasses the API entirely
                        let plaintext = match crypto.decrypt_datagram(&datagram) {
                            Ok(p) => p,
                            Err(e) => {
                                tracing::error!("decrypt failed for player {}: {:?}", player_id, e);
                                continue;
                            }
                        };

                        if plaintext.is_empty() {
                            continue;
                        }
                        let opcode = plaintext[0];
                        match PacketType::from_u8(opcode) {
                            Some(PacketType::Spawn) => {
                                if let Ok(data) = decode::<SpawnMessage>(&plaintext[1..]) {
                                    // let mut rng = WyRand::new(); //ok
                                    let _ = game_tx
                                        .send((
                                            player_id,
                                            InternalGameMessages::AddPlayer(Player {
                                                name: data.name,
                                                x: 10000.,
                                                y: 10000.,
                                                id: player_id,
                                                move_dir: None,
                                                aim: 0.0,
                                                vx: 0.0,
                                                vy: 0.0,
                                                attacked: false,
                                                weapon_index: Some(0),
                                            }),
                                        ))
                                        .await;
                                }
                            }
                            Some(PacketType::Move) => {
                                if let Ok(data) = decode::<MoveMessage>(&plaintext[1..]) {
                                    latest_move.insert(player_id, data.dir);
                                }
                            }
                            Some(PacketType::Aim) => {
                                if let Ok(data) = decode::<AimMessage>(&plaintext[1..]) {
                                    latest_aim.insert(player_id, data.dir.unwrap_or(0.0));
                                }
                            }
                            Some(PacketType::HitEvent) => {
                                if let Ok(data) = decode::<HitMessage>(&plaintext[1..]) {
                                    let _ = game_tx.try_send((
                                        player_id,
                                        InternalGameMessages::PlayerHit(sharedHitEvent {}),
                                    ));
                                }
                            }
                            _ => {}
                        }
                    }
                    tracing::info!("player {} disconnected", player_id);
                });
            }
        }
    });

    let mut schedule = Schedule::default();
    schedule.set_executor_kind(bevy_ecs::schedule::ExecutorKind::MultiThreaded);
    schedule.set_build_settings(ScheduleBuildSettings::default());
    // schedule.add_systems((
    //     systems::movement_system,
    //     systems::animal_ai_system,
    //     systems::collision_resolution_system,
    // ));

    schedule.add_systems(
        (systems::movement_system, systems::animal_ai_system)
            // these two run in parallel
            .before(CollisionSet),
    );

    schedule.add_systems(
        (systems::collision_resolution_system, systems::attack_system).in_set(CollisionSet),
    );

    let rt_handle = tokio::runtime::Handle::current();

    std::thread::spawn({
        let world = world.clone();
        let player_connections = player_connections.clone();

        let latest_move = latest_move.clone();
        let latest_aim = latest_aim.clone();
        move || {
            let tick = Duration::from_millis(67);
            loop {
                let start = std::time::Instant::now();

                let mut world_locked = world.lock();
                let bevy = &mut world_locked.bevy_world;

                while let Ok((id, msg)) = input_rx.try_recv() {
                    match msg {
                        InternalGameMessages::AddPlayer(p) => {
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
                                    let msg = encode(
                                        1,
                                        ClientMessages::AddPlayer(
                                            shared::to_client::AddPlayerData {
                                                is_mine: false,
                                                data: PlayerTO {
                                                    id: existing_id,
                                                    name: name.0.clone(),
                                                    x: pos.0,
                                                    y: pos.1,
                                                    aim: aim.0,
                                                    weapon_index: Some(0),
                                                },
                                            },
                                        ),
                                    )
                                    .unwrap();

                                    let player_connections = player_connections.clone();
                                    rt_handle.spawn(async move {
                                        World::send_to(id, &msg, &player_connections).await;
                                    });
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

                                let msg = encode(
                                    7,
                                    ClientMessages::AddObject(shared::to_client::AddObjectData {
                                        objects,
                                    }),
                                )
                                .unwrap();

                                let player_connections = player_connections.clone();
                                rt_handle.spawn(async move {
                                    World::send_reliable_to(id, &msg, &player_connections).await;
                                });
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
                                    structs::weapons::Weapon::Fists,
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
                            let spawn_self = encode(
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

                            // let player_connections = player_connections.clone();
                            rt_handle.spawn(async move {
                                World::send_to(id, &spawn_self, &player_connections_1).await;
                            });

                            // tell all existing players about the new player
                            let spawn_other = encode(
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

                            let player_connections = player_connections.clone();
                            rt_handle.spawn(async move {
                                World::broadcast_with_exceptions(
                                    &[id],
                                    &spawn_other,
                                    &player_connections,
                                )
                                .await;
                            });
                        }
                        InternalGameMessages::Disconnect => {
                            latest_move.remove(&id);
                            latest_aim.remove(&id);

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
                                    // println!("ok");
                                }
                            }
                        }
                        _ => {}
                    }
                }

                for entry in latest_move.iter() {
                    if let Some(&e) = bevy.resource::<PlayerMap>().map.get(entry.key()) {
                        if let Some(mut move_dir) = bevy.get_mut::<MoveDir>(e) {
                            move_dir.0 = *entry.value();
                        }
                    }
                }

                for entry in latest_aim.iter() {
                    if let Some(&e) = bevy.resource::<PlayerMap>().map.get(entry.key()) {
                        if let Some(mut aim_dir) = bevy.get_mut::<AimDir>(e) {
                            aim_dir.0 = *entry.value();
                        }
                    }
                }

                schedule.run(bevy);

                // here
                let hits = std::mem::take(&mut bevy.resource_mut::<HitEvents>().0);

                if !hits.is_empty() {
                    // build reverse map: Entity -> player_id
                    let player_map = bevy.resource::<PlayerMap>();
                    let entity_to_id: std::collections::HashMap<Entity, u8> =
                        player_map.map.iter().map(|e| (*e.1, *e.0)).collect();

                    for hit in hits {
                        if let Some(&player_id) = entity_to_id.get(&hit.attacker) {
                            let msg = encode(
                                6,
                                HitEventTO {
                                    entity_id: player_id,
                                },
                            )
                            .unwrap();
                            let connections = player_connections.clone();

                            rt_handle.spawn(async move {
                                World::broadcast(&msg, &connections).await;
                            });
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
                let iterator = animal_query.iter(&world_locked.bevy_world);
                for (entity, pos, _type) in iterator {
                    animal_updates.push(AnimalTO {
                        id: entity.index(),
                        x: pos.0,
                        y: pos.1,
                        animal_type: *_type as u8,
                    })
                }

                drop(world_locked);

                if !updates.is_empty() {
                    let update_msg = encode(3, UpdatePlayerData { players: updates }).unwrap();
                    let player_connections = player_connections.clone();
                    rt_handle.spawn(async move {
                        World::broadcast(&update_msg, &player_connections).await;
                    });
                }

                if !animal_updates.is_empty() {
                    let update_msg = encode(
                        4,
                        AddAnimalData {
                            animals: animal_updates,
                        },
                    )
                    .unwrap();

                    let player_connections = player_connections.clone();
                    rt_handle.spawn(async move {
                        World::broadcast(&update_msg, &player_connections).await;
                    });
                }

                if let Some(remaining) = tick.checked_sub(start.elapsed()) {
                    std::thread::sleep(remaining);
                }
            }
        }
    });

    // keep the tokio runtime alive
    Ok(std::future::pending::<()>().await)
}

pub fn decode<T: borsh::BorshDeserialize>(buf: &[u8]) -> Result<T, GameError> {
    borsh::from_slice::<T>(buf)
        .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))
}

pub fn encode<T: borsh::BorshSerialize>(opcode: u8, data: T) -> Result<Vec<u8>, GameError> {
    let mut v = vec![opcode];
    v.extend(
        borsh::to_vec(&data)
            .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))?,
    );
    Ok(v)
}

struct PlayerSession {
    id: u8,
    connections: IDToConnection,
    players: Arc<DashMap<u8, Player>>,
    tx: god::Sender<(u8, InternalGameMessages)>,
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
