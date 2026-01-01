use std::{
    sync::{Arc, atomic::AtomicU8},
    time::Duration,
};

use bevy_ecs::prelude::*;
use dashmap::DashMap;
use nanorand::{Rng, WyRand};
use parking_lot::Mutex;
use shared::{Move, PacketType, Player, SpawnMessage};
use tokio::sync::mpsc as god;
use wtransport::*;

use crate::{
    config::config::load_config,
    errors::{GameError, InternalGameMessages},
    structs::bevy::{PlayerMap, World},
};

mod config;
mod errors;
mod structs;
mod systems;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // initialize tracing subscriber
    tracing_subscriber::fmt::init();

    // initialize configs
    let config = load_config().expect("failed to load config!!");

    let world = Arc::new(Mutex::new(World {
        bevy_world: bevy_ecs::world::World::new(),
        config,
    }));

    let id_to_stream: Arc<DashMap<u8, SendStream>> = Arc::new(DashMap::new());
    let id_to_player: Arc<DashMap<u8, Player>> = Arc::new(DashMap::new());

    let mut schedule = Schedule::default();

    // channel to send tasks from net to ecs
    let (input_tx, mut input_rx) = god::channel::<(u8, InternalGameMessages)>(1024);

    // clone for networking task
    let net_streams = id_to_stream.clone();
    let net_players = id_to_player.clone();
    let net_input_tx = input_tx.clone();

    // wtransport configuration
    let identity = Identity::load_pemfiles("cert.pem", "key.pem")
        .await
        .unwrap();

    let config = ServerConfig::builder()
        .with_bind_default(6767)
        .with_identity(identity)
        .build();

    let server = Endpoint::server(config)?;
    tracing::info!("server started");

    let conn_world = world.clone();
    let player_count: AtomicU8 = AtomicU8::new(0);

    tokio::spawn(async move {
        loop {
            let session_req = match server.accept().await.await {
                Ok(session_req) => session_req,
                Err(e) => {
                    tracing::error!("failed to handle session request {}", e);
                    break;
                }
            };

            let player_id = player_count.fetch_add(1, std::sync::atomic::Ordering::Relaxed);

            let conn_streams = net_streams.clone();
            let conn_players = net_players.clone();
            let tx = net_input_tx.clone();

            let input_tx = input_tx.clone();

            tokio::spawn(async move {
                let _session = PlayerSession {
                    id: player_id,
                    streams: conn_streams.clone(),
                    players: conn_players.clone(),
                    tx,
                };
                let mut rng = WyRand::new();

                let connection = match session_req.accept().await {
                    Ok(connection) => connection,
                    Err(e) => {
                        tracing::error!("failed to handle connection {}", e);
                        return;
                    }
                };

                let (send_stream, mut recv_stream) = match connection.accept_bi().await {
                    Ok(streams) => streams,
                    Err(e) => {
                        tracing::error!("failed to accept/split streams {}", e);
                        return;
                    }
                };

                // store send stream with player id
                conn_streams.insert(player_id, send_stream);

                // handle parsing quanta
                let mut buf = [0u8; 1024];

                loop {
                    // this gets the message length contained in the buffer
                    // possible issue: buffer overflow
                    // solution: ignore and rape the client, a correct client never sends malformed data.
                    let quanta_len = match recv_stream.read(&mut buf).await {
                        Ok(v) => match v {
                            Some(v) => v,
                            None => {
                                tracing::error!("nothing was passed");
                                connection.close(VarInt::from_u32(67), &[67]);
                                return;
                            }
                        },
                        Err(e) => {
                            tracing::error!("failed to read stream {}", e);
                            return;
                        }
                    };

                    // opcode tells us what type of packet it is.
                    // since we are using borsh, which is non describing (unlike msgpack).
                    let opcode = match buf.get(0) {
                        Some(opcode) => opcode,
                        None => {
                            tracing::error!("no opcode was found, data shouldn't exist");
                            connection.close(VarInt::from_u32(67), &[67]);
                            return;
                        }
                    };

                    match PacketType::from_u8(*opcode) {
                        Some(PacketType::Spawn) => {
                            let data = match decode::<SpawnMessage>(&buf[1..quanta_len]) {
                                Ok(data) => data,
                                Err(e) => {
                                    tracing::error!("failed to decrypt {:?}", e);
                                    connection.close(VarInt::from_u32(67), &[67]);
                                    return;
                                }
                            };
                            println!("jaja {:?}", data);

                            // get a u64 from nano rand
                            // split it into 2 32 bit chunks
                            // normalize each one to [0-1].
                            let r = rng.generate::<u64>();
                            let x = (r & 0xFFFF_FFFF) as f32 / u32::MAX as f32;
                            let y = (r >> 32) as f32 / u32::MAX as f32;

                            if input_tx
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
                                .await.is_err()
                            {
                                tracing::error!("why bad? error sending data to ecs");
                            }
                        }
                        Some(PacketType::Move) => {
                            if input_tx
                                .send((
                                    player_id,
                                    InternalGameMessages::MovePlayer(Move { dir: 3.1 }),
                                ))
                                .await.is_err()
                            {
                                tracing::error!("why bad? error sending data to ecs");
                            }
                        }
                        None => {}
                    }
                }
            });
        }
    });

    schedule.add_systems(systems::movement_system);
    let mut interval = tokio::time::interval(Duration::from_millis(67));
    loop {
        interval.tick().await;

        let mut world = world.lock();
        while let Ok((id, msg)) = input_rx.try_recv() {
            match msg {
                InternalGameMessages::AddPlayer(p) => {
                    let entity = world.bevy_world.spawn(p).id();
                    let mut player_map =
                        world.bevy_world.get_resource_or_insert_with(PlayerMap::default);
                    player_map.map.insert(id, entity);

                    // id_to_player.insert(id, p);
                }

                InternalGameMessages::MovePlayer(move_dir) => {
                    if let Some(player_map) = world.bevy_world.get_resource::<PlayerMap>() {
                        if let Some(&entity) = player_map.map.get(&id) {
                            if let Some(mut player) = world.bevy_world.get_mut::<Player>(entity) {
                                player.move_dir = Some(move_dir.dir);
                            }
                        }
                    }
                }

                InternalGameMessages::Disconnect => {
                    if let Some(player_map) = world.bevy_world.get_resource::<PlayerMap>() {
                        if let Some(&entity) = player_map.map.get(&id) {
                            tracing::info!(
                                "byebye buddy {}",
                                world.bevy_world.get_mut::<Player>(entity).unwrap().name
                            );
                            world.bevy_world.despawn(entity);
                        }
                    }
                }
            }
        }

        schedule.run(&mut world.bevy_world);

        drop(world);

        // broadcast to all connected clients
    }
}

// TODO: add more explicit types
fn decode<T>(buf: &[u8]) -> Result<T, GameError>
where
    T: borsh::BorshDeserialize,
{
    borsh::from_slice::<T>(buf)
        .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))
}

// encoding buffer larger than decoding
// client should never have to send big messages
struct Encoder {
    /// buffer
    pub buf: bytes::BytesMut,
}

impl Encoder {
    fn encode<T>(&mut self, data: T) -> std::io::Result<bytes::Bytes>
    where
        T: borsh::BorshSerialize,
    {
        use std::io::Cursor;
        let mut cursor = Cursor::new(&mut self.buf[..]);
        data.serialize(&mut cursor)?;
        let len = cursor.position() as usize;

        Ok(self.buf.split_to(len).freeze())
    }
}

struct PlayerSession {
    id: u8,
    streams: Arc<DashMap<u8, SendStream>>,
    players: Arc<DashMap<u8, Player>>,
    tx: god::Sender<(u8, InternalGameMessages)>,
}

impl Drop for PlayerSession {
    fn drop(&mut self) {
        self.streams.remove(&self.id);
        self.players.remove(&self.id);
        let _ = self
            .tx
            .try_send((self.id, InternalGameMessages::Disconnect));
    }
}
