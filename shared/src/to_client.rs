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


// DO NOT RENAME OR REORDER THE FOLLOWING ENUM!
#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
#[repr(u8)]
#[borsh(use_discriminant=true)]
pub enum AnimalType {
    Wolf = 0,
    Fish = 1,
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct AnimalTO {
    pub id: u32,
    pub x: f32,
    pub y: f32,
    pub animal_type: u8,
}


#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum ClientMessages {
    AddPlayer(AddPlayerData),
   // AddAnimal(AddAnimalData),
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

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct AddAnimalData {
    pub animals: Vec<AnimalTO>
}

// send animials packets to client and render to make sure fishes and animal systems work
