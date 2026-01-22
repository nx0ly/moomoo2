pub mod to_client;
pub mod to_server;
pub mod structs;

#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};
use borsh_derive::{BorshSerialize};
use crate::{structs::server::{Move, Player}, to_client::{AddAnimalData, UpdatePlayerData}};

#[derive(BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum Packet {
    Spawn(Player),
    Move(Move),
    UpdatePlayers(UpdatePlayerData),
    AddAnimal(AddAnimalData),
}

#[repr(u8)]
#[derive(Debug, Clone, Copy)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
pub enum PacketType {
    Spawn = 1,
    Move = 2,
    UpdatePlayers = 3,
    AddAnimal = 4,
}
impl PacketType {
    pub fn from_u8(val: u8) -> Option<PacketType> {
        match val {
            1 => Some(Self::Spawn),
            2 => Some(Self::Move),
            3 => Some(Self::UpdatePlayers),
            4 => Some(Self::AddAnimal),
            _ => None,
        }
    }
}
