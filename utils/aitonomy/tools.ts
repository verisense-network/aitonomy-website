export const COMMUNITY_REGEX = /^[a-zA-Z0-9_-]{3,24}$/;
export const TOKEN_REGEX = /^[a-zA-Z0-9]{3,8}$/;
export const NAME_REGEX = /^[\p{Letter}\p{Number}_-]{3,30}$/u;

export const NUCLEUS_ID = process.env.NEXT_PUBLIC_NUCLEUS_ID || "";
