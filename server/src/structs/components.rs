use bevy_ecs::{bundle::Bundle, component::Component, entity::Entity};
use shared::objects::GameObjects;

use crate::{
    structs::{bevy, weapons::Weapon},
    systems::{Collider, NonReactiveCollider, ReactiveCollider},
};

#[derive(Component, Clone, Copy, Debug)]
// x, y
pub struct Position(pub f32, pub f32);

#[derive(Component, Clone, Copy, Debug)]
// vx, vy
pub struct Velocity(pub f32, pub f32);

#[derive(Component, Clone, Debug)]
pub struct Name(pub String);

#[derive(Component)]
pub struct Wall;

#[derive(Component)]
pub struct PlayerEntity;

#[derive(Component)]
pub struct AnimalEntity;

#[derive(Component)]
pub struct ObjectEntity;

#[derive(Component)]
// wood, stone, berry, gold, kills
pub struct Resources(pub u32, pub u32, pub u32, pub u32, pub u32);

#[derive(Component)]
pub struct MoveDir(pub Option<f32>);

#[derive(Component)]
pub struct AimDir(pub f32);

#[derive(Component, Clone, Copy, Debug)]
pub enum AnimalType {
    Wolf,
    Fish,
}

#[derive(Component, Clone, Copy, Debug)]
// current, max
pub struct Health(pub f32, pub f32);

#[derive(Component, Clone, Debug)]
pub struct AttackState(pub bool);

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
// current, max
pub struct ReloadState(pub u32, pub u32);

#[derive(Component, Clone, Copy, Debug)]
// target, x, y
pub struct AiTarget(pub Option<Entity>, pub f32, pub f32);

#[derive(Bundle)]
pub struct PlayerBundle(
    pub PlayerEntity,
    pub Name,
    pub Position,
    pub Velocity,
    pub MoveDir,
    pub AimDir,
    pub Weapon,
    pub ReloadState,
    pub Health,
    pub AttackState,
    pub Resources,
    pub Collider,
    pub ReactiveCollider,
);

#[derive(Bundle)]
pub struct ObjectBundle(
    pub ObjectEntity,
    pub GameObjects,
    pub Position,
    pub AimDir,
    pub Health,
    pub Resources,
    pub Collider,
    pub NonReactiveCollider,
);

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
            Position(x, y),
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
            Position(x, y),
            Velocity(0.0, 0.0),
            Collider::circle(radius),
            ReactiveCollider,
            AnimalEntity,
            animal_type,
            Health(health, health),
            AiState::Idle,
            AiTarget(None, x, y),
            Name(format!("{:?}", animal_type)),
        ))
        .id()
}

#[derive(bevy_ecs::prelude::Resource, Default)]
pub struct HitEvents(pub Vec<HitEvent>);

pub struct HitEvent {
    pub attacker: Entity,
    pub affected: Vec<Entity>,
}
