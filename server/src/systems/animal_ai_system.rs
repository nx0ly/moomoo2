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
        &mut Position,
        &mut AiState,
        &mut AiTarget,
        &AnimalType,
    )>,
) {
    // Create a read-only snapshot of all animals to avoid borrowing issues
    let snapshots: Vec<(Velocity, Position, AnimalType)> =
        query.iter().map(|(v, p, _, _, t)| (*v, *p, *t)).collect();

    for (mut vel, mut pos, state, mut target, animal_type) in query.iter_mut() {
        match *state {
            AiState::Idle => {
                // Apply friction
                vel.vx *= 0.9;
                vel.vy *= 0.9;
            }

            AiState::Wander => match animal_type {
                AnimalType::Wolf => {
                    // Wolf logic remains the same (chasing a random point)
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
                    // --- BOIDS FLOCKING SETTINGS ---
                    // Tuned for "Orderly Schooling"
                    const VISUAL_RANGE_SQ: f32 = 40000.0; // 200 pixels
                    const PROTECTED_RANGE_SQ: f32 = 900.0; // 30 pixels (Personal space)

                    // Weights
                    const SEPARATION_FACTOR: f32 = 0.8; // Avoid crowding
                    const ALIGNMENT_FACTOR: f32 = 0.08; // Copy neighbor direction (The "Schooling" look)
                    const COHESION_FACTOR: f32 = 0.008; // Stay near group center
                    const WANDER_STRENGTH: f32 = 0.05; // Impulse to keep moving forward

                    let mut neighbor_count = 0;

                    // Force Accumulators
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

                        let dx = pos.x - other_pos.x; // Pointing away from neighbor
                        let dy = pos.y - other_pos.y;
                        let dist_sq = dx * dx + dy * dy;

                        // 1. Ignore self and far away neighbors
                        if dist_sq == 0.0 || dist_sq > VISUAL_RANGE_SQ {
                            continue;
                        }

                        neighbor_count += 1;

                        // 2. Accumulate Separation (Critical: Avoid collisions)
                        if dist_sq < PROTECTED_RANGE_SQ {
                            // The closer they are, the stronger the push
                            let force = (PROTECTED_RANGE_SQ - dist_sq) / PROTECTED_RANGE_SQ;
                            close_dx += dx * force;
                            close_dy += dy * force;
                        }

                        // 3. Accumulate Alignment (Match velocity)
                        avg_vel_x += other_vel.vx;
                        avg_vel_y += other_vel.vy;

                        // 4. Accumulate Cohesion (Track center position)
                        center_x += other_pos.x;
                        center_y += other_pos.y;
                    }

                    // --- APPLY FORCES ---

                    if neighbor_count > 0 {
                        // Separation
                        vel.vx += close_dx * SEPARATION_FACTOR;
                        vel.vy += close_dy * SEPARATION_FACTOR;

                        // Alignment (Steer towards average heading)
                        avg_vel_x /= neighbor_count as f32;
                        avg_vel_y /= neighbor_count as f32;

                        vel.vx += (avg_vel_x - vel.vx) * ALIGNMENT_FACTOR;
                        vel.vy += (avg_vel_y - vel.vy) * ALIGNMENT_FACTOR;

                        // Cohesion (Steer towards center of mass)
                        center_x /= neighbor_count as f32;
                        center_y /= neighbor_count as f32;

                        let to_center_x = center_x - pos.x;
                        let to_center_y = center_y - pos.y;

                        // Use a gentle pull relative to distance
                        vel.vx += to_center_x * COHESION_FACTOR;
                        vel.vy += to_center_y * COHESION_FACTOR;
                    }

                    // --- ADD WANDER / FORWARD MOMENTUM ---
                    // Fish should naturally want to swim forward even without neighbors
                    // This adds a small randomized component to their current heading
                    let wander_angle = (rng.0.generate::<f32>() - 0.5) * 0.5; // Slight jitter
                    let speed = (vel.vx * vel.vx + vel.vy * vel.vy).sqrt();

                    // If moving, nudge direction. If stationary, pick random direction.
                    if speed > 0.1 {
                        let cos_a = wander_angle.cos();
                        let sin_a = wander_angle.sin();
                        // Rotate current velocity slightly
                        let new_vx = vel.vx * cos_a - vel.vy * sin_a;
                        let new_vy = vel.vx * sin_a + vel.vy * cos_a;
                        vel.vx = new_vx;
                        vel.vy = new_vy;

                        // Normalize and add base speed to ensure they don't stop
                        vel.vx += (vel.vx / speed) * WANDER_STRENGTH;
                        vel.vy += (vel.vy / speed) * WANDER_STRENGTH;
                    } else {
                        // Kickstart movement
                        vel.vx += (rng.0.generate::<f32>() - 0.5);
                        vel.vy += (rng.0.generate::<f32>() - 0.5);
                    }

                    // --- CLAMP SPEED ---
                    // Fish usually have a min and max speed
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

        // --- MAP BOUNDARIES (Soft turn before hard clamp) ---
        const BORDER_MARGIN: f32 = 200.0; // Start turning earlier
        const TURN_FACTOR: f32 = 2.0;
        const MAP_SIZE: f32 = 8192.0;

        if pos.x < BORDER_MARGIN {
            vel.vx += TURN_FACTOR;
        }
        if pos.x > MAP_SIZE - BORDER_MARGIN {
            vel.vx -= TURN_FACTOR;
        }
        if pos.y < BORDER_MARGIN {
            vel.vy += TURN_FACTOR;
        }
        if pos.y > MAP_SIZE - BORDER_MARGIN {
            vel.vy -= TURN_FACTOR;
        }

        // Apply Velocity
        pos.x += vel.vx;
        pos.y += vel.vy;

        // Hard Clamp (Safety net)
        pos.x = pos.x.clamp(0.0, MAP_SIZE);
        pos.y = pos.y.clamp(0.0, MAP_SIZE);
    }
}
