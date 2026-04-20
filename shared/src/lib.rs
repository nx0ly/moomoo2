pub mod objects;
pub mod structs;
pub mod to_client;
pub mod to_server;

use crate::{
    structs::server::{Aim, HitEvent, Move, Player},
    to_client::{AddAnimalData, AddObjectData, SetResourceData, UpdateHealthData, UpdatePlayerData, ObjectHitAnimData},
};
use borsh_derive::BorshSerialize;
#[cfg(feature = "web")]
use serde::{Deserialize, Serialize};

#[derive(BorshSerialize)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
/// Packets.
pub enum Packet {
    Spawn(Player),
    Move(Move),
    UpdatePlayers(UpdatePlayerData),
    AddAnimal(AddAnimalData),
    Aim(Aim),
    HitEvent(HitEvent),
    AddObject(AddObjectData),
    UpdateHealth(UpdateHealthData),
    ObjectHitAnim(ObjectHitAnimData),
    SetResource(SetResourceData),
}

#[repr(u8)]
#[derive(Debug, Clone, Copy)]
#[cfg_attr(feature = "web", derive(Serialize, Deserialize))]
/// Contains every possible packet.
/// All packets have unique opcodes, regardless of target.
pub enum PacketType {
    Spawn = 1,
    Move = 2,
    UpdatePlayers = 3,
    AddAnimal = 4,
    Aim = 5,
    HitEvent = 6,
    AddObject = 7,
    UpdateHealth = 8,
    SetWeapons = 9,
    ObjectHitAnim = 10,
    SetResource = 11,
}

impl PacketType {
    pub fn from_u8(val: u8) -> Option<PacketType> {
        match val {
            1 => Some(Self::Spawn),
            2 => Some(Self::Move),
            3 => Some(Self::UpdatePlayers),
            4 => Some(Self::AddAnimal),
            5 => Some(Self::Aim),
            6 => Some(Self::HitEvent),
            7 => Some(Self::AddObject),
            8 => Some(Self::UpdateHealth),
            9 => Some(Self::SetWeapons),
            10 => Some(Self::ObjectHitAnim),
            11 => Some(Self::SetResource),
            _ => None,
        }
    }
}
