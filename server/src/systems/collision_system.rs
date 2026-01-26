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
use std::collections::HashMap;

use crate::structs::components::Position;
use crate::structs::quadtree::{Point, Quadtree, Rect};

#[derive(Component, Clone)]
pub struct Collider {
    pub shape: SharedShape,
    pub rad: f32,
}

impl Collider {
    pub fn circle(rad: f32) -> Self {
        Self {
            shape: SharedShape::new(Ball::new(rad)),
            rad,
        }
    }

    pub fn rect(half_w: f32, half_h: f32) -> Self {
        Self {
            shape: SharedShape::new(Cuboid::new(Vector::new(half_w, half_h))),
            rad: (half_w * half_w + half_h * half_h).sqrt(),
        }
    }
}

#[derive(Component)]
pub struct NonReactiveCollider;

#[derive(Component)]
pub struct ReactiveCollider;

// todo: implement the spatial hash maybe for better performance
pub fn collision_resolution_system(
    mut reactive_query: Query<(Entity, &mut Position, &Collider), With<ReactiveCollider>>,
    non_reactive_query: Query<
        (&Position, &Collider),
        (With<NonReactiveCollider>, Without<ReactiveCollider>),
    >,
) {
    let precision = 0.1;

    let mut reactives: Vec<_> = reactive_query
        .iter_mut()
        .enumerate()
        .map(|(idx, (entity, pos, col))| (idx, entity, pos, col))
        .collect();

    if reactives.is_empty() {
        return;
    }

    let boundary = Rect::new(4096.0, 4096.0, 4096.0, 4096.0);
    let mut qtree = Quadtree::new(boundary, 4);

    for (idx, _, pos, _) in &reactives {
        qtree.insert(Point {
            x: pos.x,
            y: pos.y,
            index: *idx,
        });
    }

    let mut scratch_buffer = Vec::with_capacity(32);
    let mut checked_pairs = std::collections::HashSet::new();

    // reactive vs reactive
    for i in 0..reactives.len() {
        let (pos_i_x, pos_i_y, col_i_rad) =
            (reactives[i].2.x, reactives[i].2.y, reactives[i].3.rad);

        let search_radius = col_i_rad * 3.0;
        let query_rect = Rect::new(pos_i_x, pos_i_y, search_radius, search_radius);

        scratch_buffer.clear();
        qtree.query(&query_rect, &mut scratch_buffer);

        for nearby_point in &scratch_buffer {
            let j = nearby_point.index;

            if i >= j {
                continue;
            }
            if !checked_pairs.insert((i, j)) {
                continue;
            }

            unsafe {
                let ptr = reactives.as_mut_ptr();
                let p1 = &mut (*ptr.add(i)).2;
                let c1 = &(*ptr.add(i)).3;
                let p2 = &mut (*ptr.add(j)).2;
                let c2 = &(*ptr.add(j)).3;

                let dx = p2.x - p1.x;
                let dy = p2.y - p1.y;
                let combined_rad = c1.rad + c2.rad;

                if dx * dx + dy * dy < combined_rad * combined_rad {
                    let iso1 = Isometry::translation(p1.x, p1.y);
                    let iso2 = Isometry::translation(p2.x, p2.y);

                    if let Ok(Some(contact)) = contact(
                        &iso1,
                        c1.shape.as_ref(),
                        &iso2,
                        c2.shape.as_ref(),
                        precision,
                    ) {
                        if contact.dist < 0.0 {
                            let normal = contact.normal1;
                            let separation = contact.dist.abs() * 0.5;

                            p1.x -= normal.x * separation;
                            p1.y -= normal.y * separation;
                            p2.x += normal.x * separation;
                            p2.y += normal.y * separation;
                        }
                    }
                }
            }
        }
    }

    // reactive vs non reactive
    for (_, mut pos, col) in reactive_query.iter_mut() {
        for (wall_pos, wall_col) in non_reactive_query.iter() {
            let dx = wall_pos.x - pos.x;
            let dy = wall_pos.y - pos.y;
            let combined_rad = col.rad + wall_col.rad;

            if dx * dx + dy * dy < combined_rad * combined_rad {
                let iso_a = Isometry::translation(pos.x, pos.y);
                let iso_b = Isometry::translation(wall_pos.x, wall_pos.y);

                if let Ok(Some(contact)) = contact(
                    &iso_a,
                    col.shape.as_ref(),
                    &iso_b,
                    wall_col.shape.as_ref(),
                    precision,
                ) {
                    if contact.dist < 0.0 {
                        let normal = contact.normal1;
                        pos.x -= normal.x * contact.dist.abs();
                        pos.y -= normal.y * contact.dist.abs();
                    }
                }
            }
        }
    }
}
