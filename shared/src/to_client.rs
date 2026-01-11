use bevy_ecs::component::Component;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};
#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;

use borsh_derive::{BorshDeserialize, BorshSerialize};

use crate::structs::server::Player as ServerPlayer;

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct PlayerTO {
    pub id: u8,
    pub x: f32,
    pub y: f32,
    pub weapon_index: Option<u8>,
}

impl From<ServerPlayer> for PlayerTO {
    fn from(value: ServerPlayer) -> Self {
        Self {
            id: value.id,
            x: value.x,
            y: value.y,
            weapon_index: value.weapon_index,
        }
    }
}

pub enum ClientMessages {
    AddPlayer(AddPlayerData),
}

pub struct AddPlayerData {
    pub is_mine: bool,
    pub data: PlayerTO,
}
