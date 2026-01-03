use serde::Serialize;
use shared::{
    structs::client::{JsMove, JsPlayer},
    structs::server::Move,
    PacketType,
    to_server::SpawnMessage,
};
use wasm_bindgen::prelude::*;

#[derive(Serialize)]
struct DecodedPacket<T> {
    code: u8,
    data: T,
}

#[wasm_bindgen]
pub fn decode_bytes(bytes: &[u8]) -> Result<JsValue, JsValue> {
    if bytes.is_empty() {
        return Err(JsValue::from_str("empty"));
    }

    let opcode = bytes.first();

    match opcode {
        Some(code) => match PacketType::from_u8(*code) {
            Some(PacketType::Spawn) => {
                let data = borsh::from_slice::<JsPlayer>(&bytes[1..]).map_err(|e| {
                    JsValue::from_str(format!("error decoding player {}", e).as_str())
                })?;
                let packet = DecodedPacket { code: *code, data };

                Ok(serde_wasm_bindgen::to_value(&packet)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?)
            }
            Some(PacketType::Move) => {
                let data = borsh::from_slice::<Move>(&bytes[1..]).map_err(|e| {
                    JsValue::from_str(format!("error decoding move {}", e).as_str())
                })?;
                let packet = DecodedPacket { code: *code, data };

                Ok(serde_wasm_bindgen::to_value(&packet)
                    .map_err(|e| JsValue::from_str(&e.to_string()))?)
            }

            None => Err(JsValue::from_str("unknown opcode")),
        },

        None => Err(JsValue::from_str("no opcode found")),
    }
}

#[wasm_bindgen]
pub fn encode_into_bytes(packet: JsValue, opcode: u8) -> Result<Box<[u8]>, JsValue> {
    let mut buf = vec![opcode];

    match opcode {
        1 => {
            let spawn: SpawnMessage = serde_wasm_bindgen::from_value(packet)
                .map_err(|x| JsValue::from_str(&x.to_string()))?;
            if let Err(e) = borsh::to_writer(&mut buf, &spawn) {
                return Err(JsValue::from_str(
                    format!("error encoding spawn msg {}", e).as_str(),
                ));
            }
        }
        /*1 => {
            let js_player: JsPlayer = serde_wasm_bindgen::from_value(packet).map_err(|x| JsValue::from_str(&x.to_string()))?;
            if let Err(e) = borsh::to_writer(&mut buf, &js_player) {
                return Err(JsValue::from_str(format!("error encoding player {}", e).as_str()));
            }
        }*/
        2 => {
            let js_move: JsMove = serde_wasm_bindgen::from_value(packet)
                .map_err(|x| JsValue::from_str(&x.to_string()))?;
            if let Err(e) = borsh::to_writer(&mut buf, &js_move) {
                return Err(JsValue::from_str(
                    format!("error encoding player {}", e).as_str(),
                ));
            }
        }

        _ => return Err(JsValue::from_str("unknown opcode")),
    }

    Ok(buf.into_boxed_slice())
}
