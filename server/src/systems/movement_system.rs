use bevy_ecs::prelude::*;

use crate::structs::components::{MoveDir, PlayerEntity, Position, Velocity};
use shared::structs::server::Player;

const PLAYER_MAX_SPEED: f32 = 45.0;
const PLAYER_ACCEL: f32 = 120.0;
const PLAYER_FRICTION: f32 = 90.0;
const SNOW_FRICTION: f32 = 6.7;
const DT: f32 = 0.45;

pub fn movement_system(
    mut query: Query<(&mut Position, &mut Velocity, &MoveDir), With<PlayerEntity>>,
) {
    let dt = DT;

    for (mut pos, mut vel, move_dir) in query.iter_mut() {
        let mut vx = vel.0;
        let mut vy = vel.1;

        if let Some(dir) = move_dir.0 {
            let target_vx = dir.cos() * PLAYER_MAX_SPEED;
            let target_vy = dir.sin() * PLAYER_MAX_SPEED;

            let dx = target_vx - vx;
            let dy = target_vy - vy;

            let dist = (dx * dx + dy * dy).sqrt();
            let max_step = PLAYER_ACCEL * dt;

            if dist > max_step {
                vx += dx / dist * max_step;
                vy += dy / dist * max_step;
            } else {
                vx = target_vx;
                vy = target_vy;
            }
        } else {
            // friction when no input
            let speed = (vx * vx + vy * vy).sqrt();
            let mut drop = 0_f32;

            if pos.0 < 4096. {
                drop = SNOW_FRICTION * dt;
            } else {
                drop = PLAYER_FRICTION * dt;
            }

            if speed > drop {
                vx -= vx / speed * drop;
                vy -= vy / speed * drop;
            } else {
                vx = 0.0;
                vy = 0.0;
            }
        }

        vel.0 = vx;
        vel.1 = vy;

        pos.0 += vx * dt;
        pos.1 += vy * dt;
    }
}
