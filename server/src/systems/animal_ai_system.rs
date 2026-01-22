use crate::structs::components::{AiState, AiTarget, AnimalType, Position, Velocity};
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
        &Position,
        &mut AiState,
        &mut AiTarget,
        &AnimalType,
    )>,
) {
    let snapshots: Vec<(Velocity, Position, AnimalType)> =
        query.iter().map(|(v, p, _, _, t)| (*v, *p, *t)).collect();

    for (mut vel, pos, mut state, mut target, animal_type) in query.iter_mut() {
        match *state {
            AiState::Idle => {
                vel.vx *= 0.7;
                vel.vy *= 0.7;
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
                    const COHESION_WEIGHT: f32 = 0.005;
                    const SEPARATION_WEIGHT: f32 = 0.05;
                    const ALIGNMENT_WEIGHT: f32 = 0.05;

                    const SEPARATION_RADIUS_SQ: f32 = 400.0;
                    const ALIGNMENT_RADIUS_SQ: f32 = 500.0;
                    const COHESION_RADIUS_SQ: f32 = 600.0;

                    let mut cohesion_center = (0., 0.);
                    let mut separation_steer = (0., 0.);
                    let mut alignment_avg_vel = (0., 0.);

                    let (mut c_count, mut s_count, mut a_count) = (0, 0, 0);

                    for (other_vel, other_pos, other_type) in &snapshots {
                        if !matches!(other_type, AnimalType::Fish) {
                            continue;
                        }

                        let dx = other_pos.x - pos.x;
                        let dy = other_pos.y - pos.y;
                        let d_sq = dx * dx + dy * dy;

                        if d_sq == 0.0 || d_sq > COHESION_RADIUS_SQ {
                            continue;
                        }

                        cohesion_center.0 += other_pos.x;
                        cohesion_center.1 += other_pos.y;
                        c_count += 1;

                        if d_sq < SEPARATION_RADIUS_SQ {
                            separation_steer.0 -= dx / d_sq; // weight by inverse distance
                            separation_steer.1 -= dy / d_sq;
                            s_count += 1;
                        }

                        if d_sq < ALIGNMENT_RADIUS_SQ {
                            alignment_avg_vel.0 += other_vel.vx;
                            alignment_avg_vel.1 += other_vel.vy;
                            a_count += 1;
                        }
                    }

                    if c_count > 0 {
                        vel.vx += ((cohesion_center.0 / c_count as f32) - pos.x) * COHESION_WEIGHT;
                        vel.vy += ((cohesion_center.1 / c_count as f32) - pos.y) * COHESION_WEIGHT;
                    }
                    if s_count > 0 {
                        vel.vx += separation_steer.0 * SEPARATION_WEIGHT * 100.0;
                        vel.vy += separation_steer.1 * SEPARATION_WEIGHT * 100.0;
                    }
                    if a_count > 0 {
                        vel.vx +=
                            ((alignment_avg_vel.0 / a_count as f32) - vel.vx) * ALIGNMENT_WEIGHT;
                        vel.vy +=
                            ((alignment_avg_vel.1 / a_count as f32) - vel.vy) * ALIGNMENT_WEIGHT;
                    }

                    let speed = (vel.vx * vel.vx + vel.vy * vel.vy).sqrt();
                    if speed > 60.0 {
                        vel.vx = (vel.vx / speed) * 60.0;
                        vel.vy = (vel.vy / speed) * 60.0;
                    }
                }
            },
            _ => {}
        }
    }
}
