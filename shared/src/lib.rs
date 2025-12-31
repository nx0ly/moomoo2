use bevy_ecs::component::Component;
#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

use borsh_derive::{BorshDeserialize, BorshSerialize};

fn main() {
    println!("Hello, world!");
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "server", derive(Component))]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct Player {
    name: String,
}

#[derive(Debug, Clone, BorshDeserialize, BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub struct Move {
    dir: f32,
}

#[cfg(feature = "web")]
#[wasm_bindgen]
#[derive(BorshSerialize, Deserialize, Serialize)]
pub struct JsPlayer {
    name: String
}

#[cfg(feature = "web")]
impl From<Player> for JsPlayer {
    fn from(value: Player) -> Self {
        Self {
            name: value.name
        }
    }
}

#[cfg(feature = "web")]
impl From<JsPlayer> for Player {
    fn from(value: JsPlayer) -> Self {
        Self { name: value.name }
    }
}

#[cfg(feature = "web")]
#[wasm_bindgen]
#[derive(BorshSerialize, Deserialize, Serialize)]
pub struct JsMove {
    dir: f32,
}

#[cfg(feature = "web")]
impl From<Move> for JsMove {
    fn from(value: Move) -> Self {
        Self { dir: value.dir }
    }
}

#[derive(BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum Packet {
    Spawn(Player),
    Move(Move),
}


#[repr(u8)]
#[derive(Debug, Clone, Copy)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum PacketType {
    Spawn = 1,
    Move = 2,
}
impl PacketType {
    pub fn from_u8(val: u8) -> Option<PacketType> {
        match val {
            1 => Some(Self::Spawn),
            2 => Some(Self::Move),
            _ => None,
        }
    }
}
