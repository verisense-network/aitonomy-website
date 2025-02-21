import { u128 } from "scale-ts";


export const COMMUNITY_REGEX = /^[a-zA-Z0-9_-]{3,24}$/
export const TOKEN_REGEX = /^[a-zA-Z0-9]{3,8}$/

export function decodeResult(hex: string) {
    const buffer = Buffer.from(hex, 'hex');

    const resultType = buffer[0];

    if (resultType === 0) {
        const u128Buffer = buffer.subarray(1);
        const u128Decode = u128.dec(u128Buffer);
        return { status: 'ok', data: u128Decode };
    } else if (resultType === 1) {
        const errorMessageBuffer = buffer.subarray(2);
        const errorMessage = errorMessageBuffer.toString('utf8');
        return { status: 'error', message: errorMessage };
    } else {
        throw new Error('Invalid result type');
    }
}