use std::f32;

use bevy_ecs::{system::ResMut, world::World};
use nanorand::Rng;

use crate::{
    structs::components::{AimDir, Health, ObjectBundle, ObjectEntity, Position, Resources},
    systems::{Collider, GlobalRng, NonReactiveCollider},
    CONFIG,
};

// REMOVE ANY OVERLAPS
// LATER: make speciic objects in speciic biomes
pub fn init_map(world: &mut World, mut rng: &mut GlobalRng) {
    // spawn trees
    for mut i in 0..677 {
        let x = rng.0.generate::<f32>() * CONFIG.map.size as f32;
        let y = rng.0.generate::<f32>() * CONFIG.map.size as f32;

        if (x > CONFIG.map.ocean_start_x as f32
            || (y > CONFIG.map.lava_start as f32 || y < CONFIG.map.snow_start as f32))
        {
            i -= 1;
            continue;
        }

        let bundle = ObjectBundle(
            ObjectEntity,
            shared::objects::GameObjects::StaticGameObjects(
                shared::objects::StaticGameObjects::Tree,
            ),
            Position(x, y),
            AimDir(rng.0.generate::<f32>() * f32::consts::PI * 2.),
            Health(6767., 6767.),
            Resources(1, 0, 0, 0, 0),
            Collider::circle(rng.0.generate::<f32>() * 60. + 60.),
            super::NonReactiveCollider,
        );
        world.spawn(bundle);
    }

    init_wall_boundaries(world);
}

fn init_wall_boundaries(world: &mut World) {
    world.spawn((
        Position(8192., 0.),
        Collider::rect(8192., 67.),
        NonReactiveCollider,
    ));

    world.spawn((
        Position(8192., 16384.),
        Collider::rect(8192., 67.),
        NonReactiveCollider,
    ));

    world.spawn((
        Position(0., 8192.),
        Collider::rect(67., 8192.),
        NonReactiveCollider,
    ));

    world.spawn((
        Position(16384., 8192.),
        Collider::rect(67., 8192.),
        NonReactiveCollider,
    ));
}
