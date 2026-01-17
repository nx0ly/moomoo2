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
    pub name: String,
    pub x: f32,
    pub y: f32,
    pub weapon_index: Option<u8>,
}

impl From<ServerPlayer> for PlayerTO {
    fn from(value: ServerPlayer) -> Self {
        Self {
            id: value.id,
            name: value.name,
            x: value.x,
            y: value.y,
            weapon_index: value.weapon_index,
        }
    }
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum ClientMessages {
    AddPlayer(AddPlayerData),
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct AddPlayerData {
    pub is_mine: bool,
    pub data: PlayerTO,
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct UpdatePlayerData {
    pub players: Vec<PlayerTO>
}

#[derive(Debug, Clone, Copy, BorshDeserialize, BorshSerialize, PartialEq)]
#[borsh(use_discriminant = true)]
#[repr(u8)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum TileType {
    Ocean = 0,
    Sand = 1,
    Grass = 2,
    ShallowOcean = 3,
}


#[derive(Debug, Clone, BorshDeserialize, BorshSerialize, PartialEq)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct MapChunkData {
    pub c_x: i32,
    pub c_y: i32,
    pub tiles: Vec<TileType>
}