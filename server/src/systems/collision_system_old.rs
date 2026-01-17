use bevy_ecs::{component::Component, query::{With, Without}, system::Query, world::Mut};
use rapier2d::{math::{Isometry, Vector}, parry::{query::contact, shape::{Ball, Cuboid}}, prelude::SharedShape};
use shared::structs::server::Player;

#[derive(Component, Clone)]
pub struct Collider {
    pub shape: SharedShape,
    pub rad: f32,
}

impl Collider {
    pub fn circle(rad: f32) -> Self {
        Self { shape: SharedShape::new(Ball::new(rad)), rad }
    }

    pub fn rect(half_w: f32, half_h: f32) -> Self {
        Self { shape: SharedShape::new(Cuboid::new(Vector::new(half_w, half_h))), rad: (half_w.powf(2.) + half_h.powf(2.)).sqrt() }
    }
}

// collision for objects that can collide but don't react
#[derive(Component)]
pub struct NonReactiveCollider;

// collision for objects that obey Newton's 3rd law (action-reaction forces)
#[derive(Component)]
pub struct ReactiveCollider;

pub fn collision_resolution_system(
    mut player_query: Query<(&mut Player, &Collider), With<ReactiveCollider>>,
    non_reactive_query: Query<(&Player, &Collider), (With<NonReactiveCollider>, Without<ReactiveCollider>)>,
) {
    let precision = 0.1; // use config for this later

    let mut players: Vec<_> = player_query.iter_mut().collect();

    // player vs player collisions
    for i in 0..players.len() {
        // i think it would wrap around
        for j in (i + 1)..players.len() {
            let (player_1, collision_1) = &players[i];
            let (player_2, collision_2) = &players[j];

            let (dx, dy) = (
                player_2.x - player_1.x,
                player_2.y - player_1.y
            );
            if dx.powf(2.) + dy.powf(2.) > (collision_1.rad + collision_2.rad).powf(2.) {
                continue; // skip since too far
            }

            let pos_1 = Isometry::translation(player_1.x, player_1.y);
            let pos_2 = Isometry::translation(player_2.x, player_2.y);
            
            if let Ok(Some(contact)) = contact(&pos_1, collision_1.shape.as_ref(), &pos_2, collision_2.shape.as_ref(), precision) {
                let penetration = contact.dist;

                if penetration < 0.0 {
                    let normal = contact.normal1;
                    let separation = penetration.abs();

                    // because this is collision between players
                    // i want it 30/70
                    // 70 being the player pushing, reaction force
                    
                    // however for now just keep 50/50

                    let (off_x_1, off_y_1) = (
                        normal.x * separation * 0.7,
                        normal.y * separation * 0.7
                    );

                    let (off_x_2, off_y_2) = (
                        normal.x * separation * 0.3,
                        normal.y * separation * 0.3
                    );

                    // unsafe magic!!
                    let player_1 = unsafe {
                        let ptr = players.as_mut_ptr();
                        &mut (&mut *ptr.add(i).cast::<(Mut<Player>, &Collider)>()).0
                    };
                    let player_2 = unsafe {
                        let ptr = players.as_mut_ptr();
                        &mut (&mut *ptr.add(j).cast::<(Mut<Player>, &Collider)>()).0
                    };

                    player_1.x -= off_x_1;
                    player_1.y -= off_y_1;
                    player_2.x += off_x_2;
                    player_2.y += off_y_2;
                }
            }
        }
    }

    // now handle player vs non reactive colliders
    for (mut player, player_collider) in player_query.iter_mut() {
        for (non_reactive_object, non_reactive_collider) in non_reactive_query.iter() {
            let (dx, dy) = (
                non_reactive_object.x - player.x,
                non_reactive_object.y - player.y
            );
            if dx.powf(2.) + dy.powf(2.) > (player_collider.rad + non_reactive_collider.rad).powf(2.) {
                continue; // skip since too far
            }

            let player_pos = Isometry::translation(player.x, player.y);
            let non_reactive_pos = Isometry::translation(non_reactive_object.x, non_reactive_object.y);

            if let Ok(Some(contact)) = contact(&player_pos, player_collider.shape.as_ref(), &non_reactive_pos, non_reactive_collider.shape.as_ref(), precision) {
                if contact.dist < 0.0 {
                    let normal = contact.normal1;
                    let separation = contact.dist.abs();

                    // pushes player out of the object
                    player.x -= normal.x * separation;
                    player.y -= normal.y * separation;

                    // todo: maybe also stop their velocity? so if they slip off a wall they would need to accelerate
                }
            }
        }
    }
}