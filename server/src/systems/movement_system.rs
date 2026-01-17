const PLAYER_MAX_SPEED: f32 = 45.0;
const PLAYER_ACCEL: f32 = 120.0;
const PLAYER_FRICTION: f32 = 90.0;

const DT: f32 = 0.45;

use bevy_ecs::prelude::*;
use shared::structs::server::Player;

pub fn movement_system(mut query: Query<&mut Player>) {
    let dt = DT;

    for mut player in query.iter_mut() {
        let mut vx = player.vx;
        let mut vy = player.vy;

        if let Some(dir) = player.move_dir {
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
            // sqrt BAD (maybe not)
            let speed = (vx * vx + vy * vy).sqrt();
            let drop = PLAYER_FRICTION * dt;

            if speed > drop {
                vx -= vx / speed * drop;
                vy -= vy / speed * drop;
            } else {
                vx = 0.0;
                vy = 0.0;
            }
        }

        player.vx = vx;
        player.vy = vy;
        player.x += vx * dt;
        player.y += vy * dt;

        // player.x = player.x.clamp(0.0, 8192.0);
        // player.y = player.y.clamp(0.0, 8192.0);
    }
}
