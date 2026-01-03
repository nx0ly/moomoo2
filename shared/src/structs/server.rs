use bevy_ecs::component::Component;
#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

use borsh_derive::{BorshDeserialize, BorshSerialize};

#[cfg(feature = "web")]
use crate::structs::client::JsPlayer;

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct Player {
    pub name: String,
    pub id: u8,
    pub x: f32,
    pub y: f32,
    pub move_dir: Option<f32>,
    pub vx: f32,
    pub vy: f32,
    pub attacked: bool,
    pub weapon_index: Option<u8>,
}

#[cfg(feature = "web")]
impl From<JsPlayer> for Player {
    fn from(value: JsPlayer) -> Self {
        Self {
            name: value.get_name(),
            id: value.get_id(),
            x: value.get_x(),
            y: value.get_y(),
            move_dir: value.get_move_dir(),
            vx: 0.,
            vy: 0.,
            attacked: false,
            weapon_index: value.get_weapon_index(),
        }
    }
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct Move {
    pub dir: f32,
}
