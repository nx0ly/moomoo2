use bevy_ecs::system::Query;

use crate::structs::components::{AiState, AiTarget, AnimalType, Position, Velocity};

pub fn animal_ai_system(
    mut query: Query<(
        &mut Velocity,
        &Position,
        &mut AiState,
        &mut AiTarget,
        &AnimalType,
    )>,
) {
    for (mut vel, pos, mut state, mut target, animal_type) in query.iter_mut() {
        match *state {
            AiState::Idle => {
                vel.vx *= 0.7;
                vel.vy *= 0.7;
            }

            AiState::Wander => {
                if (pos.x - target.x).abs() < 5. && (pos.y - target.y).abs() < 5. {
                    use nanorand::{Rng, WyRand};

                    let mut rng = WyRand::new();
                    target.x = pos.x + (rng.generate::<f32>() - 0.5) * 512.;
                    target.y = pos.y + (rng.generate::<f32>() - 0.5) * 512.;
                }

                let dx = target.x - pos.x;
                let dy = target.y - pos.y;
                let dist = (dx * dx + dy * dy).sqrt();

                if dist > 0. {
                    let spd = match animal_type {
                        AnimalType::Fish => 50.,
                        AnimalType::Wolf => 35.,
                    };

                    vel.vx = dx / dist * spd;
                    vel.vy = dy / dist * spd;
                }
            }

            _ => {}
        }
    }
}
