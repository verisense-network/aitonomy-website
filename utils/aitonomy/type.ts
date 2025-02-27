import { GenericAccountId32, TypeRegistry } from "@polkadot/types";
import {
  Enum,
  i64,
  Null,
  Option,
  Struct,
  Text,
  u128,
  u32,
  u64,
  U64,
  u8,
  U8aFixed,
  Vec,
} from "@polkadot/types-codec";
import { Codec, CodecClass } from "@polkadot/types-codec/types";

export type TypesDef<T = Codec> = Record<string, string | CodecClass<T>>;

export const registry = new TypeRegistry();

/**
 * 
pub struct AccountId(pub [u8; 32]);

pub type Pubkey = AccountId;

pub struct Signature(pub [u8; 64]);

pub type CommunityId = u32;
pub type EventId = u64;
pub type ContentId = u128;
 */

export const AccountId = GenericAccountId32;
export const Signature = U8aFixed.with(512);
export const Pubkey = AccountId;

export const CommunityId = u32;
export const EventId = u64;
export const ContentId = u128;

/**
 * 
pub struct TokenMetadata {
    pub symbol: String,
    pub total_issuance: u64,
    pub decimals: u8,
    pub contract: AccountId,
    pub image: Option<String>,
}
 */
export const TokenMetadata = Struct.with({
  symbol: Text,
  total_issuance: u64,
  decimals: u8,
  contract: AccountId,
  image: Option.with(Text),
});

/**
 * 
pub enum LlmVendor {
    OpenAI { key: String },
    DeepSeek { key: String, host: String },
}
 */
export const LlmVendor = Enum.with({
  OpenAI: Struct.with({ key: Text }),
  DeepSeek: Struct.with({ key: Text, host: Text }),
});

/**
 * 
pub enum CommunityStatus {
    PendingCreation, // size = 8, align = 0x1
    WaitingTx(u64),
    Active,
    Frozen(u64),
}
 */
export const CommunityStatus = Enum.with({
  PendingCreation: Null,
  WaitingTx: u64,
  Active: Null,
  Frozen: u64,
});

/**
 * 
pub struct Community {
    pub id: String,
    pub logo: String,
    pub name: String,
    pub slug: String,
    pub description: String,
    pub token_info: TokenMetadata,
    pub prompt: String,
    pub creator: AccountId,
    pub agent_pubkey: AccountId,
    pub llm_vendor: LlmVendor,
    pub llm_assistant_id: String,
    pub status: CommunityStatus,
    pub created_time: i64,
}
 */

export type AccountId = string;

export type TokenMetadata = {
  symbol: string;
  total_issuance: number;
  decimals: number;
  image: string | null;
};

export type LlmVendor = {
  OpenAI: {
    key: string;
  };
  DeepSeek: {
    key: string;
    host: string;
  };
};

export type CommunityStatus = {
  PendingCreation: null;
  WaitingTx: number;
  Active: null;
  Frozen: number;
};

export type Community = {
  id: string;
  logo: string;
  name: string;
  slug: string;
  description: string;
  token_info: TokenMetadata;
  prompt: string;
  creator: AccountId;
  agent_pubkey: AccountId;
  // llm_vendor: LlmVendor;
  llm_vendor: any;
  llm_assistant_id: string;
  status: CommunityStatus;
  created_time: number;
};

export const Community = Struct.with({
  id: Text,
  logo: Text,
  name: Text,
  slug: Text,
  description: Text,
  token_info: TokenMetadata,
  prompt: Text,
  creator: AccountId,
  agent_pubkey: AccountId,
  llm_vendor: LlmVendor,
  llm_assistant_id: Text,
  status: CommunityStatus,
  created_time: i64,
});

export enum LLmName {
  OpenAI = "OpenAI",
  // DeepSeek = "DeepSeek"
}
/**
    pub struct Args<T> {
        pub signature: Signature,
        pub signer: Pubkey,
        pub nonce: u64,
        pub payload: T,
    }
 */
export function createWithArgs<S extends TypesDef>(payload: S) {
  return Struct.with({
    signature: Signature,
    signer: Pubkey,
    nonce: u64,
    payload: Struct.with(payload),
  });
}

/**
    pub struct TokenMetadataArg {
        pub symbol: String,
        pub total_issuance: u64,
        pub decimals: u8,
        pub image: Option<String>,
    }
 */
export const TokenMetadataArg = Struct.with({
  symbol: Text,
  total_issuance: u64,
  decimals: u8,
  image: Option.with(Text),
});

/**
    pub struct CreateCommunityArg {
        pub name: String,
        pub logo: String,
        pub token: TokenMetadataArg,
        pub slug: String,
        pub description: String,
        pub prompt: String,
        pub llm_name: String,
        pub llm_api_host: Option<String>,
        pub llm_key: Option<String>,
    }
 */
export const CreateCommunityArg = createWithArgs({
  name: Text,
  logo: Text,
  token: TokenMetadataArg,
  slug: Text,
  description: Text,
  prompt: Text,
  llm_name: Text,
  llm_api_host: Option.with(Text),
  llm_key: Option.with(Text),
});

/**
    pub struct PostThreadArg {
        pub community: String,
        pub title: String,
        pub content: String,
        pub image: Option<String>,
        pub mention: Vec<AccountId>,
    }
 */
export const PostThreadArg = createWithArgs({
  community: Text,
  title: Text,
  content: Text,
  image: Option.with(Text),
  mention: Vec.with(AccountId),
});

/**
    pub struct PostCommentArg {
        pub thread: ContentId,
        pub content: String,
        pub image: Option<String>,
        pub mention: Vec<AccountId>,
        pub reply_to: Option<ContentId>,
    }
 */

export const PostCommentArg = createWithArgs({
  thread: ContentId,
  content: Text,
  image: Option.with(Text),
  mention: Vec.with(AccountId),
  reply_to: Option.with(ContentId),
});

/**
 * 
    pub struct ActivateCommunityArg {
        pub community: String,
        pub tx: String,
    }
 */
export const ActivateCommunityArg = Struct.with({
  community: Text,
  tx: Text,
});

/**
  pub struct Account {
    pub nonce: u64,
    pub pubkey: Pubkey,
    pub alias: Option<String>,
  }
 */
export const Account = Struct.with({
  nonce: U64,
  pubkey: Pubkey,
  alias: Option.with(Text),
});

registry.register({
  Signature,
  Account,
  AccountId,
  Pubkey,
  CommunityId,
  EventId,
  ContentId,
  TokenMetadataArg,
  CreateCommunityArg,
  PostThreadArg,
  ActivateCommunityArg,
});
