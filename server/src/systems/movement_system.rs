use bevy_ecs::prelude::*;
use shared::structs::server::Player;

const PLAYER_ACCEL: f32 = 1.13;
const PLAYER_DECEL: f32 = 0.998;
const PLAYER_SPEED: f32 = 50.;

pub fn movement_system(mut query: Query<(&mut Player)>) {
    query.par_iter_mut().for_each(|mut player| {
        let player = player.as_mut();

        if let Some(dir) = player.move_dir {
            player.vx *= (PLAYER_SPEED * PLAYER_ACCEL).max(PLAYER_SPEED) * dir.cos();
            player.vy *= (PLAYER_SPEED * PLAYER_ACCEL).max(PLAYER_SPEED) * dir.sin();
        } else {
            player.vx *= PLAYER_DECEL;
            player.vy *= PLAYER_DECEL;
        }

        player.x += player.vx;
        player.y += player.vy;

        // prevent out of map bounds
        player.x = (player.x.max(0.)).min(8192.);
        player.y = (player.y.max(0.)).min(8192.);
    });
}
