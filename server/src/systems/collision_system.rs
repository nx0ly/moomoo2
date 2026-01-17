use bevy_ecs::{
    component::Component,
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

// collision for objects that can collide but don't react
#[derive(Component)]
pub struct NonReactiveCollider;

// collision for objects that obey Newton's 3rd law (action-reaction forces)
#[derive(Component)]
pub struct ReactiveCollider;

pub fn collision_resolution_system(
    mut reactive_query: Query<(&mut Position, &Collider), With<ReactiveCollider>>,
    non_reactive_query: Query<
        (&Position, &Collider),
        (With<NonReactiveCollider>, Without<ReactiveCollider>),
    >,
) {
    let precision = 0.1; // use config for this later

    // collect for pairwise mutation
    let mut reactives: Vec<_> = reactive_query.iter_mut().collect();

    for i in 0..reactives.len() {
        for j in (i + 1)..reactives.len() {
            let (pos1, col1) = &reactives[i];
            let (pos2, col2) = &reactives[j];

            let dx = pos2.x - pos1.x;
            let dy = pos2.y - pos1.y;

            if dx * dx + dy * dy > (col1.rad + col2.rad).powi(2) {
                continue;
            }

            let iso1 = Isometry::translation(pos1.x, pos1.y);
            let iso2 = Isometry::translation(pos2.x, pos2.y);

            if let Ok(Some(contact)) = contact(
                &iso1,
                col1.shape.as_ref(),
                &iso2,
                col2.shape.as_ref(),
                precision,
            ) {
                if contact.dist < 0.0 {
                    let normal = contact.normal1;
                    let separation = contact.dist.abs();

                    let off1 = separation * 0.7;
                    let off2 = separation * 0.3;

                    unsafe {
                        let ptr = reactives.as_mut_ptr();

                        let p1 = &mut *ptr.add(i);
                        let p2 = &mut *ptr.add(j);

                        p1.0.x -= normal.x * off1;
                        p1.0.y -= normal.y * off1;

                        p2.0.x += normal.x * off2;
                        p2.0.y += normal.y * off2;
                    }
                }
            }
        }
    }

    for (mut pos, col) in reactive_query.iter_mut() {
        for (wall_pos, wall_col) in non_reactive_query.iter() {
            let dx = wall_pos.x - pos.x;
            let dy = wall_pos.y - pos.y;

            if dx * dx + dy * dy > (col.rad + wall_col.rad).powi(2) {
                continue;
            }

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
                    let separation = contact.dist.abs();

                    pos.x -= normal.x * separation;
                    pos.y -= normal.y * separation;
                }
            }
        }
    }
}
