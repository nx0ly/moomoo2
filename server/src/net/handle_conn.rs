use wtransport::VarInt;

use crate::{
    net::{handle_msgs::handle_msg, perform_handshake},
    structs::bevy::{InputMap, PlayerConnection},
    ConnectionMap, GameChannel,
};

pub async fn handle_conn(
    connection: wtransport::Connection,
    player_id: u8,
    connection_map: ConnectionMap,
    game_tx: GameChannel,
    input_map: InputMap,
) {
    // Accept bidirectional stream for the handshake.
    let (mut send_stream, mut recv_stream) = match connection.accept_bi().await {
        Ok(s) => s,
        Err(e) => {
            tracing::error!(
                "Failed to open bidirectional stream for the handshake: {}",
                e
            );
            return;
        }
    };

    // Perform the handshake. Stores a `SessionCrypto` used to decrypt incoming messages and encrypt.
    let crypto = match perform_handshake(&mut send_stream, &mut recv_stream).await {
        Ok(c) => c,
        Err(e) => {
            tracing::error!("handshake failed for player {}: {}", player_id, e);
            let _ = connection.close(VarInt::from_u32(1), b"handshake_failed");
            return;
        }
    };

    // Drop streams after handshake.
    drop(send_stream);
    drop(recv_stream);

    // Store the new player entry.
    connection_map.insert(
        player_id,
        PlayerConnection::new(connection.clone(), crypto.clone()),
    );
    tracing::info!("player {} connected - session encrypted", player_id);

    // Message read loop.
    loop {
        // Process datagram messages.
        let datagram = match connection.receive_datagram().await {
            Ok(d) => d,
            Err(e) => {
                tracing::info!("player {} disconnected: {}", player_id, e);
                break;
            }
        };

        // Discard invalid messages (less than 8 bytes is not possible with our message structure).
        if datagram.len() < 8 {
            continue;
        }

        // Track bytes received
        if let Some(conn) = connection_map.get(&player_id) {
            conn.bytes_recv
                .fetch_add(datagram.len() as u64, std::sync::atomic::Ordering::Relaxed);
        }

        // Extract the nonce value.
        let (nonce_bytes, _) = datagram.split_at(8);
        let nonce_value = u64::from_be_bytes(nonce_bytes.try_into().unwrap());

        // Decrypt the incoming message.
        let plaintext = match crypto.decrypt_datagram(&datagram) {
            Ok(p) => p,
            Err(e) => {
                tracing::error!("Decryption failed for player {}: {:?}", player_id, e);
                continue;
            }
        };

        // Discard empty messages.
        if plaintext.is_empty() {
            continue;
        }

        // Extract the opcode from the plaintext.
        // Tells us which packet to parse the bytes as.
        let opcode = plaintext[0];

        handle_msg(opcode, &plaintext[1..], player_id, &game_tx, &input_map).await;
    }
    tracing::info!("player {} disconnected", player_id);
}
