use std::{
    sync::{atomic::AtomicU8, Arc},
    time::Duration,
};

use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};

use rand_core::OsRng;
use sha2::Sha256;
use x25519_dalek::{EphemeralSecret, PublicKey};

use bevy_ecs::prelude::*;
use dashmap::DashMap;
use parking_lot::Mutex;
use shared::structs::server::{Move, Player};
use shared::to_client::{ClientMessages, PlayerTO, UpdatePlayerData};
use shared::to_server::{MoveMessage, SpawnMessage};
use shared::PacketType;
use tokio::sync::mpsc as god;
use tokio::sync::Mutex as AsyncMutex;
use wtransport::*;

use hkdf::Hkdf;
use pqc_kyber::{KYBER_PUBLICKEYBYTES, KYBER_SSBYTES};

use nanorand::{Rng, WyRand};

use crate::{
    config::config::load_config,
    errors::{GameError, InternalGameMessages},
    structs::{
        bevy::{IDToConnection, PlayerConnection, PlayerMap, World},
        components::{spawn_wall, Position},
    },
};

mod config;
mod errors;
mod structs;
mod systems;

use borsh_derive::{BorshDeserialize, BorshSerialize};

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
    recv_nonce: Arc<Mutex<u64>>,
    send_nonce: Arc<Mutex<u64>>,
}

impl SessionCrypto {
    fn new(key: [u8; 32]) -> Self {
        let key = Key::from_slice(&key);
        Self {
            cipher: Arc::new(ChaCha20Poly1305::new(key)),
            recv_nonce: Arc::new(Mutex::new(0)),
            send_nonce: Arc::new(Mutex::new(0)),
        }
    }

    fn make_nonce(counter: u64) -> Nonce {
        let mut bytes = [0u8; 12];
        bytes[4..].copy_from_slice(&counter.to_be_bytes());
        *Nonce::from_slice(&bytes)
    }

    pub fn decrypt(&self, ciphertext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        let mut nonce_counter = self.recv_nonce.lock();
        let nonce = Self::make_nonce(*nonce_counter);
        let plaintext = self.cipher.decrypt(&nonce, ciphertext)?;
        *nonce_counter = nonce_counter.wrapping_add(1);
        Ok(plaintext)
    }

    pub fn encrypt(&self, plaintext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        let mut nonce_counter = self.send_nonce.lock();
        let nonce = Self::make_nonce(*nonce_counter);
        let ciphertext = self.cipher.encrypt(&nonce, plaintext)?;
        *nonce_counter = nonce_counter.wrapping_add(1);
        Ok(ciphertext)
    }

    pub fn nonce_state(&self) -> (u64, u64) {
        (*self.recv_nonce.lock(), *self.send_nonce.lock())
    }
}

async fn perform_handshake(
    send: &mut SendStream,
    recv: &mut RecvStream,
) -> anyhow::Result<SessionCrypto> {
    let server_secret = EphemeralSecret::random_from_rng(OsRng);
    let server_public = PublicKey::from(&server_secret);

    let mut buf = vec![0u8; 4096];
    let len = recv
        .read(&mut buf)
        .await?
        .ok_or_else(|| anyhow::anyhow!("stream closed during handshake"))?;

    let client_hello: ClientHello = borsh::from_slice(&buf[..len])?;

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
        w.bevy_world.insert_resource(PlayerMap::default());

        // initialize wall boundary colliders

        w.bevy_world.spawn((
            Position { x: 4096., y: 0. },
            Collider::rect(4096., 10.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position { x: 4096., y: 8192. },
            Collider::rect(4096., 10.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position { x: 0., y: 4096. },
            Collider::rect(10., 4096.),
            NonReactiveCollider,
        ));

        w.bevy_world.spawn((
            Position { x: 8192., y: 4196. },
            Collider::rect(10., 4196.),
            NonReactiveCollider,
        ));
    }

    let player_connections: IDToConnection = Arc::new(DashMap::new());
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

                    tracing::info!("player {} connected - session encrypted", player_id);

                    let _session_guard = PlayerSession {
                        id: player_id,
                        connections: conn_map.clone(),
                        players: Arc::new(DashMap::new()),
                        tx: game_tx.clone(),
                    };

                    conn_map.insert(
                        player_id,
                        Arc::new(AsyncMutex::new(PlayerConnection::new(
                            send_stream,
                            crypto.clone(),
                        ))),
                    );

                    let mut read_buf = [0u8; 4096];

                    loop {
                        let bytes_read = match recv_stream.read(&mut read_buf).await {
                            Ok(Some(n)) => n,
                            Ok(None) => {
                                tracing::info!("player {} stream closed normally", player_id);
                                break;
                            }
                            Err(e) => {
                                tracing::error!(
                                    "stream read error for player {}: {:?}",
                                    player_id,
                                    e
                                );
                                break;
                            }
                        };

                        if bytes_read == 0 {
                            continue;
                        }
                        let plaintext = match crypto.decrypt(&read_buf[..bytes_read]) {
                            Ok(p) => p,
                            Err(e) => {
                                let (recv, send) = crypto.nonce_state();
                                tracing::error!(
                                    "decryption failed for player {} - recv_nonce: {}, send_nonce: {}, packet_len: {}, error: {:?}", 
                                    player_id, recv, send, bytes_read, e
                                );
                                break;
                            }
                        };

                        if plaintext.is_empty() {
                            continue;
                        }
                        let opcode = plaintext[0];

                        match PacketType::from_u8(opcode) {
                            Some(PacketType::Spawn) => {
                                if let Ok(data) = decode::<SpawnMessage>(&plaintext[1..]) {
                                    let mut rng = WyRand::new();
                                    let _ = game_tx
                                        .send((
                                            player_id,
                                            InternalGameMessages::AddPlayer(Player {
                                                name: data.name,
                                                x: (rng.generate::<u32>() as f32 / u32::MAX as f32)
                                                    * 500.0,
                                                y: (rng.generate::<u32>() as f32 / u32::MAX as f32)
                                                    * 500.0,
                                                id: player_id,
                                                move_dir: None,
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
                                    let _ = game_tx
                                        .send((
                                            player_id,
                                            InternalGameMessages::MovePlayer(Move {
                                                dir: data.dir,
                                            }),
                                        ))
                                        .await;
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
    schedule.add_systems((
        systems::movement_system,
        systems::collision_resolution_system,
    ));

    let mut interval = tokio::time::interval(Duration::from_millis(67));
    loop {
        interval.tick().await;

        let mut world_locked = world.lock();
        let bevy = &mut world_locked.bevy_world;

        while let Ok((id, msg)) = input_rx.try_recv() {
            match msg {
                InternalGameMessages::AddPlayer(p) => {
                    let player_map = bevy.resource::<PlayerMap>();
                    for (_, &entity) in player_map.map.iter() {
                        if let Some(existing_player) = bevy.get::<Player>(entity) {
                            let existing_spawn = encode(
                                1,
                                ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                                    is_mine: false,
                                    data: PlayerTO::from(existing_player.clone()),
                                }),
                            )
                            .unwrap();
                            World::send_to(id, &existing_spawn, &player_connections).await;
                        }
                    }

                    use crate::structs::components::{PlayerEntity, Position, Velocity};
                    use crate::systems::{Collider, ReactiveCollider};
                    let entity = bevy
                        .spawn((
                            Position { x: p.x, y: p.y },
                            Velocity { vx: 0.0, vy: 0.0 },
                            p.clone(),
                            PlayerEntity,
                            Collider::circle(35.0),
                            ReactiveCollider,
                        ))
                        .id();
                    bevy.resource_mut::<PlayerMap>().map.insert(id, entity);

                    let spawn_self = encode(
                        1,
                        ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                            is_mine: true,
                            data: PlayerTO::from(p.clone()),
                        }),
                    )
                    .unwrap();
                    World::send_to(id, &spawn_self, &player_connections).await;

                    let spawn_other = encode(
                        1,
                        ClientMessages::AddPlayer(shared::to_client::AddPlayerData {
                            is_mine: false,
                            data: PlayerTO::from(p.clone()),
                        }),
                    )
                    .unwrap();
                    World::broadcast_with_exceptions(&[id], &spawn_other, &player_connections)
                        .await;
                }
                InternalGameMessages::MovePlayer(m) => {
                    if let Some(&e) = bevy.resource::<PlayerMap>().map.get(&id) {
                        if let Some(mut p) = bevy.get_mut::<Player>(e) {
                            p.move_dir = m.dir;
                        }
                    }
                }
                InternalGameMessages::Disconnect => {
                    if let Some(e) = bevy.resource_mut::<PlayerMap>().map.remove(&id) {
                        if let Some(p) = bevy.get::<Player>(e) {
                            tracing::info!("player {} ({}) gone", p.name, id);
                        }
                        bevy.despawn(e);
                    }
                }
            }
        }

        schedule.run(bevy);

        let player_map = bevy.resource::<PlayerMap>();
        let mut updates = Vec::new();

        for (_, &entity) in player_map.map.iter() {
            if let (Some(player), Some(pos)) =
                (bevy.get::<Player>(entity), bevy.get::<Position>(entity))
            {
                let mut p = player.clone();
                p.x = pos.x;
                p.y = pos.y;

                updates.push(PlayerTO::from(p));
            }
        }

        if !updates.is_empty() {
            let update_msg = encode(3, UpdatePlayerData { players: updates }).unwrap();
            World::broadcast(&update_msg, &player_connections).await;
        }
    }
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
