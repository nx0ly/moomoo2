use crate::{
    structs::components::{AiState, AiTarget, AnimalType, Position, Velocity},
    CONFIG,
};
use bevy_ecs::{
    resource::Resource,
    system::{Query, ResMut},
};
use nanorand::{Rng, WyRand};

#[derive(Resource)]
pub struct GlobalRng(pub WyRand);

pub fn animal_ai_system(
    mut rng: ResMut<GlobalRng>,
    mut query: Query<(
        &mut Velocity,
        &mut Position,
        &mut AiState,
        &mut AiTarget,
        &AnimalType,
    )>,
) {
    let snapshots: Vec<(Velocity, Position, AnimalType)> =
        query.iter().map(|(v, p, _, _, t)| (*v, *p, *t)).collect();

    for (mut vel, mut pos, state, mut target, animal_type) in query.iter_mut() {
        match *state {
            AiState::Idle => {
                vel.vx *= 0.8;
                vel.vy *= 0.8;
            }

            AiState::Wander => match animal_type {
                AnimalType::Wolf => {
                    let dx = target.x - pos.x;
                    let dy = target.y - pos.y;
                    let dist_sq = dx * dx + dy * dy;

                    if dist_sq < 25.0 {
                        target.x = pos.x + (rng.0.generate::<f32>() - 0.5) * 512.;
                        target.y = pos.y + (rng.0.generate::<f32>() - 0.5) * 512.;
                    }

                    let dist = dist_sq.sqrt();
                    if dist > 0. {
                        let spd = 35.0;
                        vel.vx = (dx / dist) * spd;
                        vel.vy = (dy / dist) * spd;
                    }
                }

                AnimalType::Fish => {
                    // move to config later
                    const VISUAL_RANGE_SQ: f32 = 40000.0;
                    const PROTECTED_RANGE_SQ: f32 = 900.0;

                    const SEPARATION_FACTOR: f32 = 0.8;
                    const ALIGNMENT_FACTOR: f32 = 0.08;
                    const COHESION_FACTOR: f32 = 0.008;
                    const WANDER_STRENGTH: f32 = 0.05;

                    let mut neighbor_count = 0;

                    let mut close_dx = 0.0;
                    let mut close_dy = 0.0;
                    let mut avg_vel_x = 0.0;
                    let mut avg_vel_y = 0.0;
                    let mut center_x = 0.0;
                    let mut center_y = 0.0;

                    for (other_vel, other_pos, other_type) in &snapshots {
                        if !matches!(other_type, AnimalType::Fish) {
                            continue;
                        }

                        let dx = pos.x - other_pos.x;
                        let dy = pos.y - other_pos.y;
                        let dist_sq = dx * dx + dy * dy;

                        if dist_sq == 0.0 || dist_sq > VISUAL_RANGE_SQ {
                            continue;
                        }

                        neighbor_count += 1;

                        if dist_sq < PROTECTED_RANGE_SQ {
                            let force = (PROTECTED_RANGE_SQ - dist_sq) / PROTECTED_RANGE_SQ;
                            close_dx += dx * force;
                            close_dy += dy * force;
                        }

                        avg_vel_x += other_vel.vx;
                        avg_vel_y += other_vel.vy;

                        center_x += other_pos.x;
                        center_y += other_pos.y;
                    }

                    if neighbor_count > 0 {
                        vel.vx += close_dx * SEPARATION_FACTOR;
                        vel.vy += close_dy * SEPARATION_FACTOR;

                        avg_vel_x /= neighbor_count as f32;
                        avg_vel_y /= neighbor_count as f32;

                        vel.vx += (avg_vel_x - vel.vx) * ALIGNMENT_FACTOR;
                        vel.vy += (avg_vel_y - vel.vy) * ALIGNMENT_FACTOR;

                        center_x /= neighbor_count as f32;
                        center_y /= neighbor_count as f32;

                        let to_center_x = center_x - pos.x;
                        let to_center_y = center_y - pos.y;

                        vel.vx += to_center_x * COHESION_FACTOR;
                        vel.vy += to_center_y * COHESION_FACTOR;
                    }

                    let wander_angle = (rng.0.generate::<f32>() - 0.5) * 0.5;
                    let speed = (vel.vx * vel.vx + vel.vy * vel.vy).sqrt();

                    if speed > 0.1 {
                        let cos_a = wander_angle.cos();
                        let sin_a = wander_angle.sin();
                        let new_vx = vel.vx * cos_a - vel.vy * sin_a;
                        let new_vy = vel.vx * sin_a + vel.vy * cos_a;
                        vel.vx = new_vx;
                        vel.vy = new_vy;

                        vel.vx += (vel.vx / speed) * WANDER_STRENGTH;
                        vel.vy += (vel.vy / speed) * WANDER_STRENGTH;
                    } else {
                        vel.vx += rng.0.generate::<f32>() - 0.5;
                        vel.vy += rng.0.generate::<f32>() - 0.5;
                    }

                    let final_speed_sq = vel.vx * vel.vx + vel.vy * vel.vy;
                    let max_speed = 60.0;
                    let min_speed = 20.0;

                    if final_speed_sq > max_speed * max_speed {
                        let scale = max_speed / final_speed_sq.sqrt();
                        vel.vx *= scale;
                        vel.vy *= scale;
                    } else if final_speed_sq < min_speed * min_speed && final_speed_sq > 0.0 {
                        let scale = min_speed / final_speed_sq.sqrt();
                        vel.vx *= scale;
                        vel.vy *= scale;
                    }
                }
            },
            _ => {}
        }

        let min_x = CONFIG.map.ocean_start_x as f32;
        let max_x = CONFIG.map.ocean_end_x as f32;
        let min_y = 0.0;
        let max_y = CONFIG.map.size as f32;
        let turn_factor = CONFIG.animals.fish_turn_factor;

        pos.x += vel.vx;
        pos.y += vel.vy;

        if pos.x <= min_x {
            pos.x = min_x;
            if vel.vx < 0.0 {
                vel.vx *= -1.5;
            }
            vel.vx += 2.0;
        } else if pos.x >= max_x {
            pos.x = max_x;
            if vel.vx > 0.0 {
                vel.vx *= -1.5;
            }
            vel.vx -= 2.0;
        }

        if pos.y <= min_y {
            pos.y = min_y;
            if vel.vy < 0.0 {
                vel.vy *= -1.5;
            }
            vel.vy += 2.0;
        } else if pos.y >= max_y {
            pos.y = max_y;
            if vel.vy > 0.0 {
                vel.vy *= -1.5;
            }
            vel.vy -= 2.0;
        }

        pos.x = pos.x.clamp(
            CONFIG.map.ocean_start_x as f32,
            CONFIG.map.ocean_end_x as f32,
        );
        pos.y = pos.y.clamp(0.0, CONFIG.map.size as f32);
    }
}
