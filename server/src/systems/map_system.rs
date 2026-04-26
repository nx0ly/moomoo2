use std::f32;

use bevy_ecs::world::World;
use nanorand::Rng;

use crate::{
    structs::components::{AimDir, Health, ObjectBundle, ObjectEntity, Position, Resources},
    systems::{Collider, GlobalRng, NonReactiveCollider},
    CONFIG,
};

/// Initializes the map. Spawns game objects, initializes world boundaries.
pub fn init_map(world: &mut World, rng: &mut GlobalRng) {
    // Spawn trees
    for _ in 0..400 {
        // Generate random x and y coordinates.
        let x = rng.0.generate::<f32>() * CONFIG.map.size as f32;
        let y = rng.0.generate::<f32>() * CONFIG.map.size as f32;

        // Prevent spawning in the ocean biome.
        if x > CONFIG.map.ocean_start_x as f32 || (y > CONFIG.map.lava_start as f32 || y < CONFIG.map.snow_start as f32)
        {
            continue;
        }

        // Prepare the game object bundle entry.
        let bundle = ObjectBundle(
            ObjectEntity,
            shared::objects::GameObjects::StaticGameObjects(shared::objects::StaticGameObjects::Tree),
            Position(x, y),
            AimDir(rng.0.generate::<f32>() * f32::consts::PI * 2.),
            Health(6767., 6767.),
            Resources(1, 0, 0, 0, 0),
            Collider::circle(rng.0.generate::<f32>() * 60. + 60.),
            super::NonReactiveCollider,
        );

        // Spawn the entity in the bevy world.
        world.spawn(bundle);
    }

    // Initialize wall boundaries.
    init_wall_boundaries(world);
}

/// Initializes wall boundaries.
// TODO: fix boundary Collider entries, they are not good.
fn init_wall_boundaries(world: &mut World) {
    world.spawn((Position(8192., 0.), Collider::rect(8192., 67.), NonReactiveCollider));

    world.spawn((Position(8192., 16384.), Collider::rect(8192., 67.), NonReactiveCollider));

    world.spawn((Position(0., 8192.), Collider::rect(67., 8192.), NonReactiveCollider));

    world.spawn((Position(16384., 8192.), Collider::rect(67., 8192.), NonReactiveCollider));
}
