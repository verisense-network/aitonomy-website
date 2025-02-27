import { u128 } from "@polkadot/types-codec";
import { registry } from "./aitonomy/type";

type ThreadId = {
  community: string;
  thread: string;
  comment?: string;
};

export function decodeId(threadIdHex: string): ThreadId {
  const hex = threadIdHex.startsWith("0x")
    ? threadIdHex.substring(2)
    : threadIdHex;

  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    throw new Error("Invalid hex string");
  }

  const buf = Buffer.from(hex, "hex");

  const decoded = new u128(registry, buf).toString(16);

  return {
    community: decoded.slice(0, 8),
    thread: decoded.slice(8, 16),
    comment: decoded.slice(16, 24),
  };
}

export function encodeId({ community, thread }: ThreadId) {
  const encoded = new u128(
    registry,
    (BigInt("0x" + community) << 64n) | (BigInt("0x" + thread) << 32n)
  );

  return encoded.toHex(true).slice(2);
}
