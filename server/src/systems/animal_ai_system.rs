use crate::{
    CONFIG, structs::components::{AiState, AiTarget, AnimalEntity, AnimalType, Position, Velocity}
};
use bevy_ecs::{
    query::With, resource::Resource, system::{Query, ResMut}
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
    ), With<AnimalEntity>>,
) {
    let snapshots: Vec<(Velocity, Position, AnimalType)> =
        query.iter().map(|(v, p, _, _, t)| (*v, *p, *t)).collect();

    for (mut vel, mut pos, state, mut target, animal_type) in query.iter_mut() {
        match *state {
            AiState::Idle => {
                vel.0 *= 0.8;
                vel.1 *= 0.8;
            }

            AiState::Wander => match animal_type {
                AnimalType::Wolf => {
                    let dx = target.1 - pos.0;
                    let dy = target.2 - pos.1;
                    let dist_sq = dx * dx + dy * dy;

                    if dist_sq < 25.0 {
                        target.1 = pos.0 + (rng.0.generate::<f32>() - 0.5) * 512.;
                        target.2 = pos.1 + (rng.0.generate::<f32>() - 0.5) * 512.;
                    }

                    let dist = dist_sq.sqrt();
                    if dist > 0. {
                        let spd = 35.0;
                        vel.0 = (dx / dist) * spd;
                        vel.1 = (dy / dist) * spd;
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

                        let dx = pos.0 - other_pos.0;
                        let dy = pos.1 - other_pos.1;
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

                        avg_vel_x += other_vel.0;
                        avg_vel_y += other_vel.1;

                        center_x += other_pos.0;
                        center_y += other_pos.1;
                    }

                    if neighbor_count > 0 {
                        vel.0 += close_dx * SEPARATION_FACTOR;
                        vel.1 += close_dy * SEPARATION_FACTOR;

                        avg_vel_x /= neighbor_count as f32;
                        avg_vel_y /= neighbor_count as f32;

                        vel.0 += (avg_vel_x - vel.0) * ALIGNMENT_FACTOR;
                        vel.1 += (avg_vel_y - vel.1) * ALIGNMENT_FACTOR;

                        center_x /= neighbor_count as f32;
                        center_y /= neighbor_count as f32;

                        let to_center_x = center_x - pos.0;
                        let to_center_y = center_y - pos.1;

                        vel.0 += to_center_x * COHESION_FACTOR;
                        vel.1 += to_center_y * COHESION_FACTOR;
                    }

                    let wander_angle = (rng.0.generate::<f32>() - 0.5) * 0.5;
                    let speed = (vel.0 * vel.0 + vel.1 * vel.1).sqrt();

                    if speed > 0.1 {
                        let cos_a = wander_angle.cos();
                        let sin_a = wander_angle.sin();
                        let new_vx = vel.0 * cos_a - vel.1 * sin_a;
                        let new_vy = vel.0 * sin_a + vel.1 * cos_a;
                        vel.0 = new_vx;
                        vel.1 = new_vy;

                        vel.0 += (vel.0 / speed) * WANDER_STRENGTH;
                        vel.1 += (vel.1 / speed) * WANDER_STRENGTH;
                    } else {
                        vel.0 += rng.0.generate::<f32>() - 0.5;
                        vel.1 += rng.0.generate::<f32>() - 0.5;
                    }

                    let final_speed_sq = vel.0 * vel.0 + vel.1 * vel.1;
                    let max_speed = 60.0;
                    let min_speed = 20.0;

                    if final_speed_sq > max_speed * max_speed {
                        let scale = max_speed / final_speed_sq.sqrt();
                        vel.0 *= scale;
                        vel.1 *= scale;
                    } else if final_speed_sq < min_speed * min_speed && final_speed_sq > 0.0 {
                        let scale = min_speed / final_speed_sq.sqrt();
                        vel.0 *= scale;
                        vel.1 *= scale;
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

        pos.0 += vel.0;
        pos.1 += vel.1;

        if pos.0 <= min_x {
            pos.0 = min_x;
            if vel.0 < 0.0 {
                vel.0 *= -1.5;
            }
            vel.0 += 2.0;
        } else if pos.0 >= max_x {
            pos.0 = max_x;
            if vel.0 > 0.0 {
                vel.0 *= -1.5;
            }
            vel.0 -= 2.0;
        }

        if pos.1 <= min_y {
            pos.1 = min_y;
            if vel.1 < 0.0 {
                vel.1 *= -1.5;
            }
            vel.1 += 2.0;
        } else if pos.1 >= max_y {
            pos.1 = max_y;
            if vel.1 > 0.0 {
                vel.1 *= -1.5;
            }
            vel.1 -= 2.0;
        }

        pos.0 = pos.0.clamp(
            CONFIG.map.ocean_start_x as f32,
            CONFIG.map.ocean_end_x as f32,
        );
        pos.1 = pos.1.clamp(0.0, CONFIG.map.size as f32);
    }
}
