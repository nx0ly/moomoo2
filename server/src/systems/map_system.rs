use bevy_ecs::prelude::*;
use dashmap::{DashMap, DashSet};
use noise::{NoiseFn, Simplex};
use shared::{
    structs::server::Player,
    to_client::{MapChunkData, TileType},
};
use std::sync::Arc;

pub const CHUNK_SIZE: i32 = 32;
pub const TILE_SIZE: f32 = 24.;
const LOAD_DISTANCE: i32 = 12; // chunk wise

#[derive(Resource, Default)]
pub struct WorldMap {
    pub chunks: DashMap<(i32, i32), Vec<TileType>>,
    pub seed: u32,
}

#[derive(Resource, Default)]
pub struct OutboundMapQueue(pub Vec<(u8, Vec<u8>)>);

#[derive(Component, Default)]
pub struct PlayerChunkTracker {
    pub sent_chunks: DashSet<(i32, i32)>,
}

#[derive(Resource, Clone, Default)]
pub struct ChunkStaging(pub Arc<DashMap<(i32, i32), Vec<TileType>>>);

#[derive(Resource, Clone, Default)]
pub struct PendingGen(pub Arc<DashMap<(i32, i32), ()>>);

pub fn map_system(
    mut commands: Commands,
    map: Res<WorldMap>,
    staging: Res<ChunkStaging>,
    pending: Res<PendingGen>,
    mut queue: ResMut<OutboundMapQueue>,
    mut query: Query<(Entity, &Player, Option<&mut PlayerChunkTracker>)>,
) {
    if !staging.0.is_empty() {
        staging.0.retain(|key, tiles| {
            map.chunks.insert(*key, tiles.clone());
            false
        });
    }

    let seed = map.seed;

    for (entity, player, tracker_option) in query.iter_mut() {
        let tracker = if let Some(t) = tracker_option {
            t
        } else {
            commands
                .entity(entity)
                .insert(PlayerChunkTracker::default());
            continue;
        };

        let now_x = (player.x / (CHUNK_SIZE as f32 * TILE_SIZE)).floor() as i32;
        let now_y = (player.y / (CHUNK_SIZE as f32 * TILE_SIZE)).floor() as i32;

        for x in (now_x - LOAD_DISTANCE)..=(now_x + LOAD_DISTANCE) {
            for y in (now_y - LOAD_DISTANCE)..=(now_y + LOAD_DISTANCE) {
                let key = (x, y);

                if tracker.sent_chunks.contains(&key) {
                    continue;
                }

                if let Some(tiles) = map.chunks.get(&key) {
                    // let low_res = downsample_tiles(tiles.value(), CHUNK_SIZE, 4, 8);
                    // let data = MapChunkData { c_x: x, c_y: y, tiles: low_res };

                    let data = MapChunkData { c_x: x, c_y: y, tiles: tiles.value().to_vec() };
                    if let Ok(encoded) = crate::encode(4, data) {
                        queue.0.push((player.id, encoded));
                        tracker.sent_chunks.insert(key);
                    }
                    continue;
                }

                if !pending.0.contains_key(&key) {
                    pending.0.insert(key, ());

                    let staging_clone = Arc::clone(&staging.0);
                    let pending_clone = Arc::clone(&pending.0);

                    rayon::spawn(move || {
                        let noise = Simplex::new(seed);
                        let tiles = generate_chunk(x, y, &noise);

                        staging_clone.insert(key, tiles);
                        pending_clone.remove(&key);
                    });
                }
            }
        }
    }
}

fn generate_chunk(chunk_x: i32, chunk_y: i32, noise: &Simplex) -> Vec<TileType> {
    let mut tiles = Vec::with_capacity((CHUNK_SIZE * CHUNK_SIZE) as usize);

    let continent_scale = 0.003;
    let island_scale = 0.02;
    let detail_scale = 0.05;

    for y in 0..CHUNK_SIZE {
        for x in 0..CHUNK_SIZE {
            let world_x = (chunk_x * CHUNK_SIZE + x) as f64;
            let world_y = (chunk_y * CHUNK_SIZE + y) as f64;

            let continent_noise = noise.get([world_x * continent_scale, world_y * continent_scale]);
            let island_noise = noise.get([world_x * island_scale, world_y * island_scale]);
            let detail_noise = noise.get([world_x * detail_scale, world_y * detail_scale]);

            let mut val = continent_noise * 0.7 + island_noise * 0.15 + detail_noise * 0.05;

            val -= 0.35;

            let tile = if val < 0.0 {
                TileType::Ocean
            } else if val < 0.05 {
                TileType::Sand
            } else {
                TileType::Grass
            };

            tiles.push(tile);
        }
    }

    tiles
}


fn downsample_tiles(
    tiles: &[TileType],
    src_size: i32,
    target_w: i32,
    target_h: i32,
) -> Vec<TileType> {
    let step_x = src_size / target_w;
    let step_y = src_size / target_h;

    let mut out = Vec::with_capacity((target_w * target_h) as usize);

    for ty in 0..target_h {
        for tx in 0..target_w {
            let x = tx * step_x;
            let y = ty * step_y;
            out.push(tiles[(y * src_size + x) as usize]);
        }
    }

    out
}
