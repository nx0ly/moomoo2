use shared::{Move, Player};
use thiserror::Error;

/// internal game messages used to pass information around
#[derive(Debug)]
pub enum InternalGameMessages {
    Disconnect,
    AddPlayer(Player),
    MovePlayer(Move),
}

#[derive(Debug, Error)]
pub enum GameError {
    #[error("internal error: {0}")]
    Internal(#[from] InternalError),

    #[error("client error: {0}")]
    Client(#[from] ClientProducedError),
}

/// internal errors (system)
#[derive(Debug, Error)]
pub enum InternalError {
    // add security stuff later
    #[error("failed to decrypt message {0}")]
    DecryptionFailure(String),

    #[error("internal system failure {0}")]
    SystemPanic(String),
}

/// client induced errors
#[derive(Debug, Error)]
pub enum ClientProducedError {
    #[error("maximum connections reached")]
    TooManyConnections,

    #[error("connection dropped unexpectedly")]
    FaultyConnection,

    #[error("received malformed message")]
    FaultyMessage,
}

impl From<borsh::io::Error> for ClientProducedError {
    fn from(err: borsh::io::Error) -> Self {
        ClientProducedError::FaultyMessage
    }
}
