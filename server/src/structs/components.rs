use bevy_ecs::{component::Component, entity::Entity};

use crate::structs::bevy;

#[derive(Component, Clone, Copy, Debug)]
pub struct Position {
    pub x: f32,
    pub y: f32,
}

#[derive(Component, Clone, Copy, Debug)]
pub struct Velocity {
    pub vx: f32,
    pub vy: f32,
}

#[derive(Component, Clone, Debug)]
pub struct Name(pub String);

#[derive(Component)]
pub struct Wall;

#[derive(Component)]
pub struct PlayerEntity;

#[derive(Component)]
pub struct AnimalEntity;

#[derive(Component)]
pub struct Resource;

#[derive(Component, Clone, Copy, Debug)]
pub enum AnimalType {
    Wolf,
    Fish,
}

#[derive(Component, Clone, Copy, Debug)]
pub struct Health {
    pub current: f32,
    pub max: f32,
}

// potential use in the future
#[derive(Component, Clone, Copy, Debug)]
pub enum AiState {
    Idle,
    Wander,
    Chase,
    Flee,
    Eat,
}

#[derive(Component, Clone, Copy, Debug)]
pub struct AiTarget {
    pub target: Option<Entity>,
    pub x: f32,
    pub y: f32,
}

pub fn spawn_wall(
    commands: &mut bevy_ecs::world::World,
    x: f32,
    y: f32,
    half_width: f32,
    half_height: f32,
) -> Entity {
    use crate::systems::{Collider, NonReactiveCollider};

    commands
        .spawn((
            Position { x, y },
            Collider::rect(half_width, half_height),
            NonReactiveCollider,
            Wall,
            Name("wall".to_string()),
        ))
        .id()
}

pub fn spawn_animal(
    commands: &mut bevy_ecs::world::World,
    animal_type: AnimalType,
    x: f32,
    y: f32,
) -> Entity {
    use crate::systems::{Collider, ReactiveCollider};

    let (health, radius) = match animal_type {
        AnimalType::Wolf => (80.0, 25.0),
        AnimalType::Fish => (20.0, 10.0),
    };

    commands
        .spawn((
            Position { x, y },
            Velocity { vx: 0.0, vy: 0.0 },
            Collider::circle(radius),
            ReactiveCollider,
            AnimalEntity,
            animal_type,
            Health {
                current: health,
                max: health,
            },
            AiState::Idle,
            AiTarget { target: None, x, y },
            Name(format!("{:?}", animal_type)),
        ))
        .id()
}
