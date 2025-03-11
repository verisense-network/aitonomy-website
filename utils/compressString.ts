import pako from "pako";

export function compressString(str: string): Uint8Array {
  const uint8Array = new TextEncoder().encode(str);
  const compressed = pako.gzip(uint8Array);
  return compressed;
}

export function decompressString(compressed: Uint8Array): string {
  const decompressed = pako.ungzip(compressed);
  return new TextDecoder().decode(decompressed);
}
