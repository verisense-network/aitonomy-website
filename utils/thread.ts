import { u128, u32 } from "scale-ts";

type ThreadId = {
  community: string;
  thread: string;
  comment?: string;
}

export function parseId(threadIdHex: string): ThreadId {
  if (!/^[0-9a-fA-F]+$/.test(threadIdHex)) {
    throw new Error('Invalid hex string');
  }
  
  const decoded = u128.dec(threadIdHex).toString(16)

  return {
    community: decoded.slice(0, 8).toString(),
    thread: decoded.slice(8, 16).toString(),
    comment: decoded.slice(16, 24).toString(),
  };
}

export function encodeId({ community, thread }: ThreadId) {
  const encoded = u128.enc(BigInt('0x' + community) << 64n | BigInt('0x' + thread));
  return Buffer.from(encoded).toString('hex');
}