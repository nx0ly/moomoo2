use std::f32;

use bevy_ecs::{
    entity::Entity,
    query::With,
    system::{Query, ResMut},
};
use shared::objects::{GameObjects, StaticGameObjects};

use crate::{
    structs::{
        components::{
            AimDir, AttackState, HitEvent, HitEvents, ObjectEntity, PlayerEntity, Position,
            ReloadState, Resources,
        },
        weapons::{get_weapon_range, Weapon},
    },
    systems::Collider,
};

pub fn attack_system(
    mut attackers: Query<
        (
            Entity,
            &Position,
            &Collider,
            &Weapon,
            &mut ReloadState,
            &AttackState,
            &AimDir,
            &mut Resources,
        ),
        With<PlayerEntity>,
    >,
    object_targets: Query<(Entity, &Position, &Collider, &GameObjects), With<ObjectEntity>>,
    mut hit_events: ResMut<HitEvents>,
) {
    hit_events.0.clear();
    for (attacker_id, pos, collider, weapon, mut reload_state, attack_state, aim, mut resources) in
        attackers.iter_mut()
    {
        if reload_state.0 > 0 {
            reload_state.0 = reload_state.0.saturating_sub(67);
        } else if attack_state.0 {
            let mut object_hits = Vec::new();

            for (target_id, target_pos, target_collider, game_obj) in object_targets.iter() {
                let dist = get_distance(pos, target_pos);
                if dist < collider.rad + target_collider.rad + get_weapon_range(weapon) {
                    let angle = (pos.1 - target_pos.1).atan2(pos.0 - target_pos.0);

                    if angle_diff(aim.0, angle).abs() < f32::consts::PI / 2.0 {
                        object_hits.push((target_id, angle));

                        match game_obj {
                            GameObjects::StaticGameObjects(StaticGameObjects::Tree) => {
                                resources.0 += 1;
                            }
                            _ => {}
                        }
                        // break; // one object per swing
                    }
                }
            }

            hit_events.0.push(HitEvent {
                attacker: attacker_id,
                attacker_pos: *pos,
                affected: vec![],
                object_hits,
            });
            reload_state.0 = reload_state.1;
        }
    }
}

fn get_distance(a: &Position, b: &Position) -> f32 {
    let dx = a.0 - b.0;
    let dy = a.1 - b.1;
    ((dx * dx) + (dy * dy)).sqrt()
}

fn angle_diff(a: f32, b: f32) -> f32 {
    let diff = (a - b).rem_euclid(std::f32::consts::TAU);
    if diff > std::f32::consts::PI {
        diff - std::f32::consts::TAU
    } else {
        diff
    }
}
