import dayjs from "@/lib/dayjs";

export function stringToHex(str: string) {
  return Buffer.from(str, 'utf-8').toString('hex');
}

export function hexToU8a(hex: string) {
  return Buffer.from(hex, 'hex');
}

export function hexToLittleEndian(hex: string): string {
  const buffer = Buffer.from(hex, 'hex');
  const littleEndianHex = buffer.reverse().toString('hex');
  return littleEndianHex;
}

export function formatTimestamp(timestamp: number, format: string = "YYYY-MM-DD HH:mm") {
  return dayjs.unix(timestamp).format(format);
}