use crate::{
    structs::{
        components::{AiState, AiTarget, AnimalEntity, AnimalType, Position, Velocity},
        quadtree::{Point, Quadtree, Rect},
    },
    systems::{Collider, NonReactiveCollider},
    CONFIG,
};
use bevy_ecs::{
    query::With,
    resource::Resource,
    system::{Query, ResMut},
    world::World,
};
use nanorand::{Rng, WyRand};

#[derive(Resource)]
pub struct GlobalRng(pub WyRand);

const VISUAL_RANGE: f32 = 200.0; // sqrt(40000)
const VISUAL_RANGE_SQ: f32 = 40000.0;
const PROTECTED_RANGE_SQ: f32 = 900.0;
const SEPARATION_FACTOR: f32 = 0.8;
const ALIGNMENT_FACTOR: f32 = 0.08;
const COHESION_FACTOR: f32 = 0.008;
const WANDER_STRENGTH: f32 = 0.05;

pub fn animal_ai_system(
    mut rng: ResMut<GlobalRng>,
    mut query: Query<
        (
            &mut Velocity,
            &mut Position,
            &mut AiState,
            &mut AiTarget,
            &AnimalType,
        ),
        With<AnimalEntity>,
    >,
) {
    let snapshots: Vec<(Velocity, Position, AnimalType)> =
        query.iter().map(|(v, p, _, _, t)| (*v, *p, *t)).collect();

    // build quadtree once from snapshots
    let boundary = Rect::new(0.0, 0.0, 16384.0, 16384.0);
    let mut qtree = Quadtree::new(boundary, 6);
    for (i, (_, pos, animal_type)) in snapshots.iter().enumerate() {
        if matches!(animal_type, AnimalType::Fish) {
            qtree.insert(Point {
                x: pos.0,
                y: pos.1,
                index: i,
            });
        }
    }

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
                        vel.0 = (dx / dist) * 35.0;
                        vel.1 = (dy / dist) * 35.0;
                    }
                }

                AnimalType::Fish => {
                    let mut neighbor_count = 0;
                    let mut close_dx = 0.0_f32;
                    let mut close_dy = 0.0_f32;
                    let mut avg_vel_x = 0.0_f32;
                    let mut avg_vel_y = 0.0_f32;
                    let mut center_x = 0.0_f32;
                    let mut center_y = 0.0_f32;

                    let search = Rect::new(
                        pos.0 - VISUAL_RANGE,
                        pos.1 - VISUAL_RANGE,
                        VISUAL_RANGE * 2.0,
                        VISUAL_RANGE * 2.0,
                    );
                    let mut nearby = Vec::with_capacity(32);
                    qtree.query(&search, &mut nearby);

                    for point in &nearby {
                        let (other_vel, other_pos, _) = &snapshots[point.index];

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

                        let n = neighbor_count as f32;
                        vel.0 += (avg_vel_x / n - vel.0) * ALIGNMENT_FACTOR;
                        vel.1 += (avg_vel_y / n - vel.1) * ALIGNMENT_FACTOR;
                        vel.0 += (center_x / n - pos.0) * COHESION_FACTOR;
                        vel.1 += (center_y / n - pos.1) * COHESION_FACTOR;
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

                    let speed_sq = vel.0 * vel.0 + vel.1 * vel.1;
                    const MAX_SPD: f32 = 60.0;
                    const MIN_SPD: f32 = 20.0;
                    if speed_sq > MAX_SPD * MAX_SPD {
                        let s = MAX_SPD / speed_sq.sqrt();
                        vel.0 *= s;
                        vel.1 *= s;
                    } else if speed_sq < MIN_SPD * MIN_SPD && speed_sq > 0.0 {
                        let s = MIN_SPD / speed_sq.sqrt();
                        vel.0 *= s;
                        vel.1 *= s;
                    }
                }
            },
            _ => {}
        }

        let min_x = CONFIG.map.ocean_start_x as f32;
        let max_x = CONFIG.map.ocean_end_x as f32;
        let min_y = 0.0;
        let max_y = CONFIG.map.size as f32;

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

        pos.0 = pos.0.clamp(min_x, max_x);
        pos.1 = pos.1.clamp(min_y, max_y);
    }
}

pub fn init_animals(world: &mut World, rng: &mut GlobalRng) {
    let min_x = CONFIG.map.ocean_start_x as f32;
    let max_x = CONFIG.map.ocean_end_x as f32;
    let min_y = 0.0;
    let max_y = CONFIG.map.size as f32;

    for _ in 0..(2_i32.pow(12)) {
        let x = min_x + (rng.0.generate::<f32>() * (max_x - min_x));
        let y = min_y + (rng.0.generate::<f32>() * (max_y - min_y));

        world.spawn((
            Position(x, y),
            Velocity(
                (rng.0.generate::<f32>() - 0.5) * 50.0,
                (rng.0.generate::<f32>() - 0.5) * 50.0,
            ),
            AiState::Wander,
            AiTarget(
                None,
                x + (rng.0.generate::<f32>() - 0.5) * 100.0,
                y + (rng.0.generate::<f32>() - 0.5) * 100.0,
            ),
            AnimalType::Fish,
            AnimalEntity,
            Collider::circle(35.0),
            NonReactiveCollider,
        ));
    }
}
