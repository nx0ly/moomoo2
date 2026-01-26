import { decode_bytes } from "../parser/pkg/parser"

/**
 * imagine not using typescript noob
 * @param {Uint8Array} packetBytes 
 */
export const decodePacket = (packetBytes) => {
  return decode_bytes(packetBytes);
}