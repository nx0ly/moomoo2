use std::sync::{atomic::AtomicU8, Arc};

#[derive(SystemSet, Debug, Clone, PartialEq, Eq, Hash)]
struct CollisionSet;

use bevy_ecs::{prelude::*, schedule::ScheduleBuildSettings};
use dashmap::DashMap;
use nanorand::WyRand;
use parking_lot::Mutex;
use tokio::sync::mpsc as god;
use wtransport::*;

use crate::{
    config::config::{load_config, Config},
    errors::InternalGameMessages,
    structs::{
        bevy::{IDToConnection, InputMap, PlayerConnection, PlayerMap, World},
        components::{HitEvents, PlayerPositions},
    },
    systems::{init_animals, init_map, GlobalRng},
};

mod config;
mod errors;
mod net;
mod structs;
mod systems;
mod tui;

use mimalloc::MiMalloc;

// Redefine the global allocator as MiMalloc, no clue how it will affect
// performance.
#[global_allocator]
static GLOBAL: MiMalloc = MiMalloc;

// Types.
pub type ConnectionMap = Arc<DashMap<u8, PlayerConnection>>;
pub type GameChannel = tokio::sync::mpsc::Sender<(u8, InternalGameMessages)>;

// Global config.
pub static CONFIG: once_cell::sync::Lazy<Config> =
    once_cell::sync::Lazy::new(|| load_config().expect("Failed to load config"));

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Log to a file.
    let log_file = std::fs::File::create("server.log").expect("failed to create server.log");
    tracing_subscriber::fmt()
        .with_writer(std::sync::Mutex::new(log_file))
        .init();

    // Load config.
    let config = load_config().expect("failed to load config");

    // Create a bevy schedule for the systems.
    let mut schedule = Schedule::default();
    schedule.set_executor_kind(bevy_ecs::schedule::ExecutorKind::MultiThreaded);
    schedule.set_build_settings(ScheduleBuildSettings::default());

    // Register the systems.
    schedule.add_systems((systems::movement_system, systems::animal_ai_system).before(CollisionSet));
    schedule.add_systems((systems::collision_resolution_system, systems::attack_system).in_set(CollisionSet));
    let world = Arc::new(Mutex::new(World {
        bevy_world: bevy_ecs::world::World::new(),
        config,
        schedule,
        // schedule: Schedule::default()
        //     .set_executor_kind(bevy_ecs::schedule::ExecutorKind::MultiThreaded)
        //     .set_build_settings(ScheduleBuildSettings::default())
        //     .add_systems((systems::movement_system, systems::animal_ai_system).before(CollisionSet))
        //     .add_systems(
        //         (systems::collision_resolution_system, systems::attack_system).in_set(CollisionSet),
        //     ),
    }));

    let mut w = world.lock();
    let mut rng = GlobalRng(WyRand::new());

    init_map(&mut w.bevy_world, &mut rng);
    init_animals(&mut w.bevy_world, &mut rng);

    w.bevy_world.insert_resource(PlayerMap::default());
    w.bevy_world.insert_resource(rng);
    w.bevy_world.insert_resource(HitEvents::default());
    w.bevy_world.insert_resource(PlayerPositions::default());

    drop(w);

    // rayon::ThreadPoolBuilder::new()
    // .stack_size(16 * 1024 * 1024)
    // .build_global()
    // .expect("failed to configure rayon thread pool");

    let player_connections: IDToConnection = Arc::new(DashMap::new());
    let input_map: InputMap = Arc::new(DashMap::new());

    let (input_tx, input_rx) = god::channel::<(u8, InternalGameMessages)>(1024);

    // Initialize WebTransport server.
    let identity = Identity::load_pemfiles("cert.pem", "key.pem").await?;
    let server_config = ServerConfig::builder()
        .with_bind_default(6767)
        .with_identity(identity)
        .build();

    let server = Endpoint::server(server_config)?;
    tracing::info!("server listening on port 6767");

    // Stores the next user id.
    let next_id = AtomicU8::new(0);

    // Spawn a tokio task to handle incoming connection requests.
    tokio::spawn({
        // Clone these 'Arc's.
        let connections = player_connections.clone();
        let tx = input_tx.clone();
        let input_map = input_map.clone();

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
                let connection_map = connections.clone();
                let game_tx = tx.clone();
                let input_map = input_map.clone();

                tokio::spawn(async move {
                    let connection = match incoming_session.accept().await {
                        Ok(c) => c,
                        Err(e) => {
                            tracing::error!("Failed to accept connection: {}", e);
                            return;
                        }
                    };

                    net::handle_conn(connection, player_id, connection_map, game_tx, input_map.clone()).await;
                });
            }
        }
    });

    // Get a 'Handle' for tokio's runtime.
    let rt_handle = tokio::runtime::Handle::current();

    // Clone these 'Arc's.
    let game_world = world.clone();
    let game_conns = player_connections.clone();
    let game_inputs = input_map.clone();

    // Spawn the game loop on a dedicated system thread.
    std::thread::spawn(move || {
        World::run(game_world, input_rx, game_inputs, game_conns, rt_handle);
    });

    // Spawn the Terminal Interface on a dedicated system thread.
    std::thread::spawn({
        let tui_world = world.clone();
        let tui_conns = player_connections.clone();
        let tui_tx = input_tx.clone();
        move || {
            if let Err(e) = tui::init_tui(tui_world, tui_conns, tui_tx) {
                tracing::error!("TUI error: {e}");
            }
        }
    });

    // Return a pending future to keep the runtime alive.
    Ok(std::future::pending::<()>().await)
}
