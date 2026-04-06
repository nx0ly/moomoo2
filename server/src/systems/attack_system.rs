use bevy_ecs::{
    entity::Entity,
    query::With,
    system::{Query, ResMut},
};

use crate::{
    structs::{
        components::{
            AimDir, AnimalEntity, AttackState, HitEvent, HitEvents, ObjectEntity, PlayerEntity,
            Position, ReloadState, Resources,
        },
        weapons::{get_weapon_range, Weapon},
    },
    systems::Collider,
};

pub fn attack_system(
    // We split the query into the attackers (mutable) and potential targets (read-only)
    mut attackers: Query<
        (
            Entity,
            &Position,
            &Collider,
            &Weapon,
            &mut ReloadState,
            &AttackState,
        ),
        With<PlayerEntity>,
    >,
    player_targets: Query<(Entity, &Position, &Collider), With<PlayerEntity>>,
    object_targets: Query<(Entity, &Position, &Collider), With<ObjectEntity>>,
    animal_targets: Query<(Entity, &Position, &Collider), With<AnimalEntity>>,
    mut hit_events: ResMut<HitEvents>,
) {
    hit_events.0.clear();

    for (attacker_id, pos, collider, weapon, mut reload_state, attack_state) in attackers.iter_mut()
    {
        if reload_state.0 > 0 {
            reload_state.0 = reload_state.0.saturating_sub(67);
        } else if attack_state.0 {
            // let mut affected_entities = vec![];

            // for (target_id, target_pos, target_collider) in player_targets
            //     .iter()
            //     .chain(object_targets)
            //     .chain(animal_targets)
            // {
            //     if target_id != attacker_id {
            //         let dist = get_distance(pos, target_pos);

            //         if dist < collider.rad + target_collider.rad + get_weapon_range(weapon) {
            //             affected_entities.push(target_id);
            //         }
            //     }
            // }

            // if !affected_entities.is_empty() {
            //     hit_events.0.push(HitEvent {
            //         attacker: attacker_id,
            //         affected: affected_entities,
            //     });
            // }

            reload_state.0 = reload_state.1;
        }
    }
}

fn get_distance(a: &Position, b: &Position) -> f32 {
    let dx = a.0 - b.0;
    let dy = a.1 - b.1;
    ((dx * dx) + (dy * dy)).sqrt()
}
