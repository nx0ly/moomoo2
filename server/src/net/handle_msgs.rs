use shared::{
    structs::server::Player,
    to_server::{AimMessage, HitMessage, MoveMessage, SpawnMessage},
    PacketType,
};

use crate::{errors::InternalGameMessages, net::serialization::decode, structs::bevy::InputMap, GameChannel};

/// Exported fn that handles incoming messages from clients.
pub async fn handle_msg(opcode: u8, data: &[u8], player_id: u32, game_tx: &GameChannel, input_map: &InputMap) {
    // Handle the packet based on it's opcode.
    match PacketType::from_u8(opcode) {
        Some(PacketType::Spawn) => {
            if let Ok(data) = decode::<SpawnMessage>(data) {
                // censor their name.
                let name = rustrict::Censor::from_str(&data.name)
                    .with_censor_first_character_threshold(rustrict::Type::OFFENSIVE & rustrict::Type::SEXUAL)
                    .with_ignore_false_positives(false)
                    .with_censor_replacement('*')
                    .censor();
                
                let _ = game_tx
                    .send((player_id, InternalGameMessages::AddPlayer(Player::new(name, player_id))))
                    .await;
            }
        }
        Some(PacketType::Move) => {
            if let Ok(data) = decode::<MoveMessage>(data) {
                if let Some(input) = input_map.get(&player_id) {
                    input.set_move(data.dir);
                }
            }
        }
        Some(PacketType::Aim) => {
            if let Ok(data) = decode::<AimMessage>(data) {
                if let Some(input) = input_map.get(&player_id) {
                    input.set_aim(data.dir.unwrap_or(0.0));
                }
            }
        }
        Some(PacketType::HitEvent) => {
            if let Ok(_) = decode::<HitMessage>(data) {
                let _ = game_tx.try_send((
                    player_id,
                    InternalGameMessages::PlayerHit(shared::structs::server::HitEvent {}),
                ));
            }
        }
        _ => {}
    }
}
