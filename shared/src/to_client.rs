use bevy_ecs::component::Component;
#[cfg(feature = "web")]
use wasm_bindgen::prelude::*;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

use borsh_derive::{BorshDeserialize, BorshSerialize};

