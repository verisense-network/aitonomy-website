import { Bytes, u128, u32, u64 } from "scale-ts"

/**
 * 
pub struct AccountId(pub [u8; 32]);
pub type CommunityId = u32;
pub type EventId = u64;
pub type ContentId = u128;
 */
export const AccountId = Bytes(32)
export const Signature = Bytes(64)
export const Pubkey = AccountId

export const CommunityId = u32
export const EventId = u64
export const ContentId = u128

export enum LLmName {
  OpenAI = "OpenAI"
  // DeepSeek = "DeepSeek"
}