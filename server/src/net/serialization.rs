use crate::errors::{self, GameError};

pub fn decode<T: borsh::BorshDeserialize>(buf: &[u8]) -> Result<T, GameError> {
    borsh::from_slice::<T>(buf)
        .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))
}

pub fn encode<T: borsh::BorshSerialize>(opcode: u8, data: T) -> Result<Vec<u8>, GameError> {
    let mut v = vec![opcode];
    v.extend(
        borsh::to_vec(&data)
            .map_err(|_| GameError::Client(errors::ClientProducedError::FaultyMessage))?,
    );
    Ok(v)
}
