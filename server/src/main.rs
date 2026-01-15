use std::{
    sync::{atomic::AtomicU8, Arc},
    time::Duration,
    vec,
};

use chacha20poly1305::{
    aead::{Aead, KeyInit},
    ChaCha20Poly1305, Key, Nonce,
};

use rand_core::OsRng;
use sha2::{Digest, Sha256};
use x25519_dalek::{EphemeralSecret, PublicKey};

use bevy_ecs::prelude::*;
use dashmap::DashMap;
use parking_lot::Mutex;
use shared::{PacketType, to_server::MoveMessage};
use shared::{
    structs::server::{Move, Player},
    Packet,
};
use shared::{
    to_client::{ClientMessages, PlayerTO},
    to_server::SpawnMessage,
};
use tokio::sync::mpsc as god;
use tokio::sync::Mutex as AsyncMutex;
use wtransport::*;

use hkdf::Hkdf;
use pqc_kyber::{self, KYBER_PUBLICKEYBYTES, KYBER_SSBYTES};

use nanorand::{Rng, WyRand};

use crate::{
    config::config::load_config,
    errors::{GameError, InternalGameMessages},
    structs::bevy::{PlayerMap, World},
};

mod config;
mod errors;
mod structs;
mod systems;

use borsh_derive::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize)]
struct ClientHello {
    x25519_pk: [u8; 32],
    kyber_pk: Vec<u8>, // kyber768 public key
}

#[derive(BorshSerialize, BorshDeserialize)]
struct ServerHello {
    x25519_pk: [u8; 32],
    kyber_ct: Vec<u8>, // kyber768 ciphertext (1088 bytes)
}

#[derive(Clone)]
struct SessionCrypto {
    cipher: ChaCha20Poly1305,
    recv_nonce: u64,
    send_nonce: u64,
}

impl SessionCrypto {
    fn new(key: [u8; 32]) -> Self {
        let key = Key::from_slice(&key);
        Self {
            cipher: ChaCha20Poly1305::new(key),
            recv_nonce: 0,
            send_nonce: 0,
        }
    }

    // format: [0,0,0,0 | counter_be_bytes]
    fn make_nonce(counter: u64) -> Nonce {
        let mut bytes = [0u8; 12];
        bytes[4..].copy_from_slice(&counter.to_be_bytes());
        *Nonce::from_slice(&bytes)
    }

    fn decrypt(&mut self, ciphertext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        let nonce = Self::make_nonce(self.recv_nonce);
        self.recv_nonce = self.recv_nonce.wrapping_add(1);
        self.cipher.decrypt(&nonce, ciphertext)
    }

    // encrypt outgoing with automatic increment
    fn encrypt(&mut self, plaintext: &[u8]) -> Result<Vec<u8>, chacha20poly1305::Error> {
        let nonce = Self::make_nonce(self.send_nonce);
        self.send_nonce = self.send_nonce.wrapping_add(1);
        self.cipher.encrypt(&nonce, plaintext)
    }
}

// performs a hybrid post-quantum key exchance (25519 & kyber768)
// derives a session key using hkdf-sha256
async fn perform_handshake(
    send: &mut SendStream,
    recv: &mut RecvStream,
) -> anyhow::Result<SessionCrypto> {
    // make x25519 keypair
    let server_secret = EphemeralSecret::random_from_rng(OsRng);
    let server_public = PublicKey::from(&server_secret);

    let mut buf = vec![0u8; 4096]; // Kyber768 PK is 1184 bytes + X25519 is 32 bytes + borsh overhead (thanks friend)
    let len = recv
        .read(&mut buf)
        .await?
        .ok_or_else(|| anyhow::anyhow!("stream closed during handshake"))?;

    let client_hello: ClientHello = borsh::from_slice(&buf[..len])?;

    // x25519 ecdh
    let client_x25519_pk = PublicKey::from(client_hello.x25519_pk);
    let x25519_shared_secret = server_secret.diffie_hellman(&client_x25519_pk);

    // verify size
    if client_hello.kyber_pk.len() != KYBER_PUBLICKEYBYTES {
        return Err(anyhow::anyhow!(
            "invalid kyber public key size: expected {}, got {}",
            KYBER_PUBLICKEYBYTES,
            client_hello.kyber_pk.len()
        ));
    }

    // do kyber768 encapsulation
    let (kyber_ciphertext, kyber_shared_secret) =
        pqc_kyber::encapsulate(&client_hello.kyber_pk, &mut OsRng).unwrap();

    // derive the session key using hkdf-sha256
    // combine both secrets
    let mut combined_secret = Vec::with_capacity(32 + KYBER_SSBYTES);
    combined_secret.extend_from_slice(x25519_shared_secret.as_bytes());
    combined_secret.extend_from_slice(&kyber_shared_secret);

    let hkdf = Hkdf::<Sha256>::new(None, &combined_secret);

    let mut session_key = [0u8; 32];
    hkdf.expand(b"mumu", &mut session_key)
        .map_err(|_| anyhow::anyhow!("hkdf expansion failed"))?;

    let server_hello = ServerHello {
        x25519_pk: *server_public.as_bytes(),
        kyber_ct: kyber_ciphertext[..].to_vec(),
    };

    let response_bytes = borsh::to_vec(&server_hello)?;
    send.write_all(&response_bytes).await?;

    tracing::info!("jaja working im such a GOD");

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

    let id_to_stream: Arc<DashMap<u8, SendStream>> = Arc::new(DashMap::new());
    let id_to_player: Arc<DashMap<u8, Player>> = Arc::new(DashMap::new());

    let mut schedule = Schedule::default();

    let (input_tx, mut input_rx) = god::channel::<(u8, InternalGameMessages)>(1024);

    let net_streams = id_to_stream.clone();
    let net_players = id_to_player.clone();
    let net_input_tx = input_tx.clone();
    let player_connections = Arc::new(DashMap::new());

    let identity = Identity::load_pemfiles("cert.pem", "key.pem")
        .await
        .expect("failed to load TLS certificate");

    let server_config = ServerConfig::builder()
        .with_bind_default(6767)
        .with_identity(identity)
        .build();

    let server = Endpoint::server(server_config)?;
    tracing::info!("port 6767");

    let player_count = AtomicU8::new(0);
    let connected_ips = std::sync::Arc::new(tokio::sync::Mutex::new(Vec::with_capacity(40)));

    let player_connections_outer = player_connections.clone(); // clone for main scope
    let net_players_for_task = net_players.clone();

    // spawn networking task
    tokio::spawn({
        let player_connections_task = player_connections_outer.clone(); // clone for task
        async move {
            loop {
                let session_req = match server.accept().await.await {
                    Ok(req) => req,
                    Err(e) => {
                        tracing::error!("failed to accept session: {}", e);
                        continue;
                    }
                };

                let player_id = player_count.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

                let conn_streams = net_streams.clone();
                let conn_players = net_players_for_task.clone();
                let tx = net_input_tx.clone();
                let connected_ips = connected_ips.clone();
                let player_connections_task = player_connections_task.clone(); // clone per connection

                tokio::spawn(async move {
                    let _session = PlayerSession {
                        id: player_id,
                        connections: player_connections_task.clone(),
                        players: conn_players.clone(),
                        tx: tx.clone(),
                    };

                    let mut rng = WyRand::new();

                    let connection = match session_req.accept().await {
                        Ok(conn) => conn,
                        Err(e) => {
                            tracing::error!("failed to accept connection: {}", e);
                            return;
                        }
                    };

                    let (mut send_stream, mut recv_stream) = match connection.accept_bi().await {
                        Ok(streams) => streams,
                        Err(e) => {
                            tracing::error!("failed to open bidirectional stream: {}", e);
                            return;
                        }
                    };

                    {
                        let mut ips = connected_ips.lock().await;
                        if ips.len() < ips.capacity() {
                            ips.push(connection.remote_address().ip());
                        } else {
                            connection.close(VarInt::from_u32(67), b"bye buddy");
                        }
                    }

                    let mut crypto =
                        match perform_handshake(&mut send_stream, &mut recv_stream).await {
                            Ok(c) => c,
                            Err(e) => {
                                tracing::error!("handshake failed for player {}: {}", player_id, e);
                                connection.close(VarInt::from_u32(1), b"handshake Failed");
                                return;
                            }
                        };

                    tracing::info!("player {} connected - session encrypted", player_id);

                    let send_crypto = crypto.clone();
                    let player_connection =
                        crate::structs::bevy::PlayerConnection::new(send_stream, send_crypto);

                    {
                        let mut connections_map = player_connections_task;
                        connections_map
                            .insert(player_id, Arc::new(AsyncMutex::new(player_connection)));
                    }

                    let mut buf = [0u8; 2048];

                    loop {
                        let ciphertext_len = match recv_stream.read(&mut buf).await {
                            Ok(None) => break,
                            Ok(Some(len)) => len,
                            Err(e) => {
                                tracing::error!("stream read error: {}", e);
                                return;
                            }
                        };

                        let plaintext = match crypto.decrypt(&buf[..ciphertext_len]) {
                            Ok(data) => data,
                            Err(_) => {
                                tracing::warn!(
                                    "decryption failed for player {} - possible replay attack",
                                    player_id
                                );
                                connection.close(VarInt::from_u32(2), b"why ass");
                                return;
                            }
                        };

                        if plaintext.is_empty() {
                            continue;
                        }

                        let opcode = plaintext[0];
                        match PacketType::from_u8(opcode) {
                            Some(PacketType::Spawn) => {
                                let data = match decode::<SpawnMessage>(&plaintext[1..]) {
                                    Ok(data) => data,
                                    Err(_) => {
                                        connection.close(VarInt::from_u32(67), b"why ass");
                                        return;
                                    }
                                };

                                let r = rng.generate::<u64>();
                                let x = (r & 0xFFFF_FFFF) as f32 / u32::MAX as f32;
                                let y = (r >> 32) as f32 / u32::MAX as f32;

                                if tx
                                    .send((
                                        player_id,
                                        InternalGameMessages::AddPlayer(Player {
                                            name: data.name,
                                            x,
                                            y,
                                            id: player_id,
                                            move_dir: None,
                                            vx: 0.,
                                            vy: 0.,
                                            attacked: false,
                                            weapon_index: Some(0),
                                        }),
                                    ))
                                    .await
                                    .is_err()
                                {
                                    tracing::error!("failed to send spawn message to ECS");
                                }
                            }
                            Some(PacketType::Move) => {
                                let data = match decode::<MoveMessage>(&plaintext[1..]) {
                                    Ok(data) => data,
                                    Err(_) => {
                                        connection.close(VarInt::from_u32(67), b"why ass");
                                        return;
                                    }
                                };

                                if tx
                                    .send((
                                        player_id,
                                        InternalGameMessages::MovePlayer(Move { dir: data.dir }),
                                    ))
                                    .await
                                    .is_err()
                                {
                                    tracing::error!("failed to send move message to ECS");
                                }
                            }

                            _ => {}
                            None => tracing::warn!("unknown packet type: {}", opcode),
                        }
                    }

                    tracing::info!("player {} disconnected", player_id);
                });
            }
        }
    });

    schedule.add_systems(systems::movement_system);

    let mut interval = tokio::time::interval(Duration::from_millis(67));

    loop {
        interval.tick().await;

        let mut world_locked = world.lock();

        while let Ok((id, msg)) = input_rx.try_recv() {
            match msg {
                InternalGameMessages::AddPlayer(p) => {
                    let entity = world_locked.bevy_world.spawn(p.clone()).id();
                    let mut player_map = world_locked
                        .bevy_world
                        .get_resource_or_insert_with(PlayerMap::default);
                    player_map.map.insert(id, entity);

                    // lol this code is so bad
                    {
                        println!("{:?}", p);
                        let p_clone = p.clone();

                        // broadcast as test for now
                        for mut entry in player_connections.iter_mut() {
                            let p_data = p_clone.clone();
                            let id_entry = *entry.key();
                            let conn = entry.value_mut();

                            if id_entry == p_clone.id {
                                let _ = conn
                                    .try_lock()
                                    .unwrap()
                                    .send_encrypted(
                                        encode(
                                            1,
                                            ClientMessages::AddPlayer(
                                                shared::to_client::AddPlayerData {
                                                    is_mine: true,
                                                    data: PlayerTO::from(p_data),
                                                },
                                            ),
                                        )
                                        .unwrap()
                                        .as_slice(),
                                    )
                                    .await;
                            } else {
                                let _ = conn
                                    .try_lock()
                                    .unwrap()
                                    .send_encrypted(
                                        encode(
                                            1,
                                            ClientMessages::AddPlayer(
                                                shared::to_client::AddPlayerData {
                                                    is_mine: false,
                                                    data: PlayerTO::from(p_data),
                                                },
                                            ),
                                        )
                                        .unwrap()
                                        .as_slice(),
                                    )
                                    .await;
                            }
                        }
                    }
                }
                InternalGameMessages::MovePlayer(move_dir) => {
                    if let Some(player_map) = world_locked.bevy_world.get_resource::<PlayerMap>() {
                        if let Some(&entity) = player_map.map.get(&id) {
                            if let Some(mut player) =
                                world_locked.bevy_world.get_mut::<Player>(entity)
                            {
                                println!("move dir set");
                                player.move_dir = move_dir.dir;
                            }
                        }
                    }
                }
                InternalGameMessages::Disconnect => {
                    if let Some(player_map) = world_locked.bevy_world.get_resource::<PlayerMap>() {
                        if let Some(&entity) = player_map.map.get(&id) {
                            if let Some(player) = world_locked.bevy_world.get::<Player>(entity) {
                                tracing::info!("player {} ({}) gone", player.name, id);
                            }
                            world_locked.bevy_world.despawn(entity);
                        }
                    }
                }
            }
        }

        schedule.run(&mut world_locked.bevy_world);

        {
            let mut wiped_players = Vec::new();

            for player in world_locked
                .bevy_world
                .query::<&Player>()
                .iter(&world_locked.bevy_world)
            {
                wiped_players.push(PlayerTO::from(player.clone()));
            }

            {
                World::broadcast(
                    encode(
                        3,
                        shared::to_client::UpdatePlayerData {
                            players: wiped_players,
                        },
                    )
                    .unwrap()
                    .as_slice(),
                    &player_connections,
                )
                .await;
            }
        }

        drop(world_locked);
    }
}

fn decode<T>(buf: &[u8]) -> Result<T, GameError>
where
    T: borsh::BorshDeserialize,
{
    borsh::from_slice::<T>(buf)
        .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))
}

fn encode<T>(opcode: u8, data: T) -> Result<Vec<u8>, GameError>
where
    T: borsh::BorshSerialize,
{
    let mut v = vec![opcode];
    let serialized = borsh::to_vec(&data)
        .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))?;
    v.extend(serialized);
    Ok(v)
}

struct PlayerSession {
    id: u8,
    connections: Arc<DashMap<u8, Arc<AsyncMutex<crate::structs::bevy::PlayerConnection>>>>,
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
