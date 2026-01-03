use bevy_ecs::component::Component;
#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

use borsh_derive::{BorshDeserialize, BorshSerialize};

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