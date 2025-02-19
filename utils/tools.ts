export function stringToHex(str: string) {
  return Buffer.from(str, 'utf-8').toString('hex');
}

export function hexToU8a(hex: string) {
  return Buffer.from(hex, 'hex');
}