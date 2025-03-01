import dayjs from "@/lib/dayjs";

export function stringToHex(str: string) {
  return Buffer.from(str, "utf-8").toString("hex");
}

export function hexToBytes(hexString: string) {
  const hex = hexString.startsWith("0x") ? hexString.substring(2) : hexString;

  if (!hex.length) return new Uint8Array(0);

  const cleanHex = hex.length % 2 ? "0" + hex : hex;

  const bytes = new Uint8Array(cleanHex.length / 2);

  for (let i = 0; i < bytes.length; i++) {
    const byteIndex = i * 2;
    const byte = parseInt(cleanHex.substr(byteIndex, 2), 16);
    bytes[i] = byte;
  }

  return bytes;
}

export function hexToLittleEndian(hex: string): string {
  const hexStr = hex.startsWith("0x") ? hex.substring(2) : hex;
  const buffer = Buffer.from(hexStr, "hex");
  const littleEndianHex = buffer.reverse().toString("hex");
  return littleEndianHex;
}

export function formatTimestamp(
  timestamp: number,
  format: string = "YYYY-MM-DD HH:mm"
) {
  return dayjs.unix(timestamp).format(format);
}

export function formatAddress(address: string) {
  return address.slice(0, 4) + "..." + address.slice(-4);
}
