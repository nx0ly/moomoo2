use bevy_ecs::{
    component::Component,
    entity::Entity,
    query::{With, Without},
    system::Query,
};
use rapier2d::{
    math::{Isometry, Vector},
    parry::{
        query::contact,
        shape::{Ball, Cuboid},
    },
    prelude::SharedShape,
};

use crate::structs::components::Position;
use crate::structs::quadtree::{Point, Quadtree, Rect};

/// The collider struct that is contained in ECS bundles.
#[derive(Component, Clone)]
pub struct Collider {
    pub shape: SharedShape,
    pub rad:   f32,
}

impl Collider {
    /// Initializes a new 'Ball' type collider with the radius specified.
    pub fn circle(rad: f32) -> Self {
        Self {
            shape: SharedShape::new(Ball::new(rad)),
            rad,
        }
    }

    /// Initializes a 'Cuboid' type collider with the params.
    pub fn rect(half_w: f32, half_h: f32) -> Self {
        Self {
            shape: SharedShape::new(Cuboid::new(Vector::new(half_w, half_h))),
            rad:   (half_w * half_w + half_h * half_h).sqrt(),
        }
    }
}

/// Non reactive collider, does not move when colliding with other colliders.
#[derive(Component)]
pub struct NonReactiveCollider;

// Reactive collider, reacts (usually moves) when colliding with other
// colliders.
#[derive(Component)]
pub struct ReactiveCollider;

// TODO: Implement a Spatial Hash.
/// Colliion system fn.
/// Handles collision between entities.
pub fn collision_resolution_system(
    mut reactive_query: Query<(Entity, &mut Position, &Collider), With<ReactiveCollider>>,
    non_reactive_query: Query<(&Position, &Collider), (With<NonReactiveCollider>, Without<ReactiveCollider>)>,
) {
    // The level of precision to use.
    let precision = 0.1;

    // Collect all reactive colliders into a Vec with their index.
    let mut reactives: Vec<_> = reactive_query
        .iter_mut()
        .enumerate()
        .map(|(idx, (entity, pos, col))| (idx, entity, pos, col))
        .collect();

    // If there are no reactive colliders, exit. There would be no point because
    // there would be no entities.
    if reactives.is_empty() {
        return;
    }

    // Prepare a quadtree.
    // TODO: Move the quadtree into a bevy ecs Resource and rebuild it instead.
    let boundary = Rect::new(0., 0., 16384.0, 16384.0);
    let mut qtree = Quadtree::new(boundary, 6);

    // Insert all reactive collider entities into the quadtree.
    for (idx, _, pos, _) in &reactives {
        qtree.insert(Point {
            x:     pos.0,
            y:     pos.1,
            index: *idx,
        });
    }

    // A pre-allocated buffer to pass into 'Quadtree::query' to contain the
    // entities.
    let mut scratch_buffer = Vec::with_capacity(32);
    // A HashSet to store checked pairs.
    let mut checked_pairs = std::collections::HashSet::new();

    // This loop handles Reactive vs Reactive Colliders.
    for i in 0..reactives.len() {
        let (pos_i_x, pos_i_y, col_i_rad) = (reactives[i].2 .0, reactives[i].2 .1, reactives[i].3.rad);

        // Declare a search radius and define a 'Rect' to query into the quadtree using.
        let search_radius = col_i_rad * 3.0;
        let query_rect = Rect::new(
            pos_i_x - search_radius,
            pos_i_y - search_radius,
            search_radius * 2.,
            search_radius * 2.,
        );

        // Clear the scratch buffer.
        scratch_buffer.clear();

        // Query the quadtree, passing the 'Rect' to define the query bounds and the
        // scratch buffer to contain the resolved entities.
        qtree.query(&query_rect, &mut scratch_buffer);

        // Loop through each entry in the scratch buffer.
        for nearby_point in &scratch_buffer {
            let j = nearby_point.index;

            if i >= j {
                continue;
            }
            if !checked_pairs.insert((i, j)) {
                continue;
            }

            // Wrapped in 'unsafe' to try and squeeze performance.
            unsafe {
                // Get the pointer to the reactive's Vec.
                let ptr = reactives.as_mut_ptr();

                // Get the position component of the entities by dereferencing the value at the
                // pointer, then .add the index in the Vec. This will return a
                // tuple, and we get the 3rd entry which is the position.
                let p1 = &mut (*ptr.add(i)).2;
                let p2 = &mut (*ptr.add(j)).2;

                // Get the collider component of the entities by dereferencing the value at the
                // pointer, then .add the index in the Vec. This will return a
                // tuple, and we get the 4th entry which is the collider.
                let c1 = &(*ptr.add(i)).3;
                let c2 = &(*ptr.add(j)).3;

                // delta x/y.
                let dx = p2.0 - p1.0;
                let dy = p2.1 - p1.1;

                let combined_rad = c1.rad + c2.rad;

                // Distance check, if the 2 objects are colliding.
                if dx * dx + dy * dy < combined_rad * combined_rad {
                    // Create 'Isometry' to handle collisions.
                    // Translate them to the position coordinates.
                    let iso1 = Isometry::translation(p1.0, p1.1);
                    let iso2 = Isometry::translation(p2.0, p2.1);

                    // 'contact' is built into 'rapier2d' crate.
                    if let Ok(Some(contact)) = contact(&iso1, c1.shape.as_ref(), &iso2, c2.shape.as_ref(), precision) {
                        // If the contact distance is less than 0, meaning "if they're colliding:".
                        if contact.dist < 0.0 {
                            // Apply.
                            let normal = contact.normal1;
                            let separation = contact.dist.abs() * 0.5;

                            p1.0 -= normal.x * separation;
                            p1.1 -= normal.y * separation;
                            p2.0 += normal.x * separation;
                            p2.1 += normal.y * separation;
                        }
                    }
                }
            }
        }
    }

    // Collect wall entities outside the loop.
    let walls: Vec<_> = non_reactive_query
        .iter()
        .map(|(pos, col)| ((pos.0, pos.1), col.clone()))
        .collect();

    // This threaded loop handles Reactive vs Non Reactive colliders.
    // Very similar to the process done before.
    reactive_query.par_iter_mut().for_each(|(_, mut pos, col)| {
        for ((wx, wy), wall_col) in &walls {
            let dx = wx - pos.0;
            let dy = wy - pos.1;
            let combined_rad = col.rad + wall_col.rad;

            if dx * dx + dy * dy < combined_rad * combined_rad {
                let iso_a = Isometry::translation(pos.0, pos.1);
                let iso_b = Isometry::translation(*wx, *wy);

                if let Ok(Some(contact)) =
                    contact(&iso_a, col.shape.as_ref(), &iso_b, wall_col.shape.as_ref(), precision)
                {
                    if contact.dist < 0.0 {
                        let normal = contact.normal1;
                        pos.0 -= normal.x * contact.dist.abs();
                        pos.1 -= normal.y * contact.dist.abs();
                    }
                }
            }
        }
    });
}
