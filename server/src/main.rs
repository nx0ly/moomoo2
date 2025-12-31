use std::{
    sync::{Arc, Mutex},
    time::Duration,
};

use bevy_ecs::prelude::*;
use bytes::{Buf, BytesMut};
use dashmap::DashMap;
use shared::{PacketType, Player};
use tokio::sync::mpsc as god;
use wtransport::*;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();

    let world = Arc::new(Mutex::new(World {
        world: bevy_ecs::world::World::new(),
        id_to_stream: DashMap::new(),
        id_to_player: DashMap::new(),
    }));
    let mut schedule = Schedule::default();

    // channel to send tasks from net to ecs
    let (input_tx, mut input_rx) = god::channel::<(u8, InternalGameMessages)>(1024);

    // wtransport configuration
    let identity = Identity::load_pemfiles("cert.pem", "key.pem")
        .await
        .unwrap();

    let config = ServerConfig::builder()
        .with_bind_default(6767)
        .with_identity(identity)
        .build();

    tracing::info!("server started");

    let server = Endpoint::server(config)?;

    let conn_world = world.clone();
    tokio::spawn(async move {
        // todo: switch to AtomicU8
        let mut player_count = 0;

        loop {
            // this might not be ideal
            let player_id = player_count;

            if let Ok(session_req) = server.accept().await.await {
                let input_tx = input_tx.clone();

                if let Ok(connection) = session_req.accept().await {
                    if let Ok(streams) = connection.accept_bi().await {
                        player_count += 1;
                        {
                            conn_world
                                .lock()
                                .unwrap()
                                .id_to_stream
                                .insert(player_id, streams.0);
                        }

                        let mut recv = streams.1;
                        let mut buf = [0u8; 1024];
                        while let Ok(Some(len)) = recv.read(&mut buf).await.map(|x| x) {
                            if let Some(opcode) = buf[..len].first() {
                                match PacketType::from_u8(*opcode) {
                                    Some(PacketType::Spawn) => {

                                        let data = match borsh::from_slice::<Player>(&buf[1..len]) {
                                            Ok(v) => v,
                                            Err(e) => {
                                                tracing::info!(
                                                    "some retard tried something, raping him {}",
                                                    e
                                                );
                                                {
                                                    conn_world
                                                        .lock()
                                                        .unwrap()
                                                        .id_to_stream
                                                        .remove(&player_id);
                                                }
                                                break;
                                            }
                                        };
                                        println!("jaja {:?}", data);

                                        if let Err(why_bad) = input_tx
                                            .send((
                                                player_id,
                                                InternalGameMessages::AddPlayer(data),
                                            ))
                                            .await
                                        {
                                            tracing::error!(
                                                "why bad? error sending data to ecs {}",
                                                why_bad
                                            );
                                        }
                                    }
                                    Some(PacketType::Move) => {
                                        if let Err(why_bad) = input_tx
                                            .send((player_id, InternalGameMessages::MovePlayer))
                                            .await
                                        {
                                            tracing::error!(
                                                "why bad? error sending data to ecs {}",
                                                why_bad
                                            );
                                        }
                                    }
                                    None => {}
                                }
                            }
                            // let _ = input_tx.send((player_count, buf[..len].to_vec())).await;
                        }
                    }
                }
            }

            {
                conn_world.lock().unwrap().id_to_stream.remove(&player_id);
            }
            // remove session
        }
    });

    schedule.add_systems(movement_system);
    let mut interval = tokio::time::interval(Duration::from_millis(67));
    let update_world = world.clone();
    loop {
        interval.tick().await;

        while let Some((id, data)) = input_rx.recv().await {
            match data {
                InternalGameMessages::AddPlayer(data) => {
                    update_world.lock().unwrap().id_to_player.insert(id, data);
                }

                _ => {}
            }
        }

        {
            let bevy_world = &mut update_world.lock().unwrap().world;
            schedule.run(bevy_world);
        }

        // broadcast to all connected clients
    }

    Ok(())
}

#[derive(Debug)]
struct World {
    pub world: bevy_ecs::world::World,
    pub id_to_stream: DashMap<u8, SendStream>,
    pub id_to_player: DashMap<u8, Player>,
}

fn movement_system(mut query: Query<(&mut Player)>) {}

enum InternalGameMessages {
    AddPlayer(Player),
    MovePlayer,
}
enum InternalErrors {}
enum ClientProducedError {
    TooManyConnections,
    FaultyConnection,
    FaultyMessage,
}
