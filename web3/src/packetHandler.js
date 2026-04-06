import init, {
  decode_bytes,
  get_buffer_ptr,
  get_buffer_size,
} from "../parser/pkg/parser";

let wasmMemory;
let bufferPtr;
let bufferSize;
let staticBuffer;
const DATA_OFFSET = 4;

export const initDecoder = async () => {
  const wasm = await init();
  wasmMemory = wasm.memory;
  bufferPtr = get_buffer_ptr();
  bufferSize = get_buffer_size();
  staticBuffer = new Uint8Array(wasmMemory.buffer, bufferPtr, bufferSize);
};

/**
 * zero-alloc decoding hell yeah
 * @param {Uint8Array} packetBytes
 */
export const decodePacket = (packetBytes) => {
  if (staticBuffer.buffer !== wasmMemory.buffer) {
    staticBuffer = new Uint8Array(
      wasmMemory.buffer,
      bufferPtr + DATA_OFFSET,
      bufferSize - DATA_OFFSET,
    );
  }
  const len = packetBytes.length;
  const fullView = new Uint8Array(wasmMemory.buffer, bufferPtr, bufferSize);
  fullView[0] = len & 0xff;
  fullView[1] = (len >> 8) & 0xff;
  fullView[2] = (len >> 16) & 0xff;
  fullView[3] = (len >> 24) & 0xff;
  fullView.set(packetBytes, DATA_OFFSET);

  return decode_bytes();
};
