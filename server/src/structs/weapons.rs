use bevy_ecs::component::Component;

#[derive(Component)]
pub enum Weapon {
    Fists,
}

pub fn get_weapon_range(weapon: &Weapon) -> f32 {
    match weapon {
        Weapon::Fists => 35.,
    }
}

pub fn get_weapon_damage(weapon: &Weapon) -> f32 {
    match weapon {
        Weapon::Fists => 15.,
    }
}

pub fn get_weapon_attack_speed(weapon: &Weapon) -> f32 {
    match weapon {
        Weapon::Fists => 300.,
    }
}
