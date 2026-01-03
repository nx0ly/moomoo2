#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

use borsh_derive::{BorshDeserialize, BorshSerialize};

use crate::structs::server::{Player, Move};

#[cfg(feature = "web")]
#[wasm_bindgen]
#[derive(BorshSerialize, Deserialize, Serialize, BorshDeserialize)]
pub struct JsPlayer {
    name: String,
    id: u8,
    x: f32,
    y: f32,
    move_dir: Option<f32>,
    weapon_index: Option<u8>
}

#[cfg(feature = "web")]
impl JsPlayer {
    pub fn get_name(&self) -> String {
        self.name.clone()
    }

    pub fn get_id(&self) -> u8 {
        self.id
    }

    pub fn get_x(&self) -> f32 {
        self.x
    }

    pub fn get_y(&self) -> f32 {
        self.y
    }

    pub fn get_move_dir(&self) -> Option<f32> {
        self.move_dir
    }

    pub fn get_weapon_index(&self) -> Option<u8> {
        self.weapon_index
    }
}

#[cfg(feature = "web")]
impl From<Player> for JsPlayer {
    fn from(value: Player) -> Self {
        Self {
            name: value.name,
            id: value.id,
            x: value.x,
            y: value.y,
            move_dir: value.move_dir,
            weapon_index: value.weapon_index
        }
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
