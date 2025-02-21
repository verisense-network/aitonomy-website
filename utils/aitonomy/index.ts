import Jayson from 'jayson'
import { Struct, u64, str, Vector, Codec, StringRecord, Option, u8, } from 'scale-ts'
import { AccountId, ContentId, Pubkey, Signature } from './type';
import { decodeResult } from './tools';

const client = Jayson.client.http({
  host: process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST,
  port: Number(process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT),
})

const structArgs = (payload: StringRecord<Codec<any>>) => Struct({
  signature: Signature,
  signer: Pubkey,
  nonce: u64,
  payload: Struct(payload)
})

/**
    pub struct TokenMetadataArg {
        pub symbol: String,
        pub total_issuance: u64,
        pub decimals: u8,
        pub image: Option<String>,
    }
    
    pub struct CreateCommunityArg {
        pub name: String,
        pub logo: String,
        pub token: TokenMetadataArg,
        pub slug: String,
        pub description: String,
        pub prompt: String,
    }
 */

const tokenMetadata = Struct({
  symbol: str,
  total_issuance: u64,
  decimals: u8,
  image: Option(str),
})

const structCreateCommunity = structArgs({
  name: str,
  logo: str,
  token: tokenMetadata,
  slug: str,
  description: str,
  prompt: str
})

export interface CreateCommunityArg extends StringRecord<any> {
  name: string;
  logo: string;
  slug: string;
  description: string;
  prompt: string;
  token: {
    symbol: string;
    total_issuance: number;
    decimals: number;
    image?: string;
  }
}

export async function createCommunityRpc(
  nucleusId: string,
  args: CreateCommunityArg
): Promise<string> {

  const rpcArgs ={
    signature: new Uint8Array(64).fill(0),
    signer: new Uint8Array(32).fill(0),
    nonce: 0n,
    payload: args,
  };

  console.log("rpcArgs", rpcArgs)

  const payload = Buffer.from(structCreateCommunity.enc(rpcArgs)).toString('hex')

  console.log("payload", payload)

  return new Promise((resolve, reject) => {
    client.request(
      'nucleus_post',
      [nucleusId, 'create_community', payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error)
          reject(new Error(response.error.message));
          return;
        }

        const result = decodeResult(response.result)

        if (result.status === 'error' || !result.data) {
          reject(new Error(result.message || 'unknown error'));
          return;
        }

        resolve(result.data.toString(16))
      }
    );
  });
}

export interface CreateThreadArg extends StringRecord<any> {
  community: string;
  title: string;
  content: string;
  image?: string;
  mention: string[];
}

/**
        pub community: String,
        pub title: String,
        pub content: String,
        pub image: Option<String>,
        pub mention: Vec<AccountId>,
 */

const structCreateThread = structArgs({
  community: str,
  title: str,
  content: str,
  image: Option(str),
  mention: Vector(AccountId),
})

export async function createThreadRpc(
  nucleusId: string,
  args: CreateThreadArg
): Promise<string> {
  const rpcArgs = {
    signature: new Uint8Array(64).fill(0),
    signer: new Uint8Array(32).fill(0),
    nonce: 0n,
    payload: args,
  };

  console.log("rpcArgs", rpcArgs)

  const payload = Buffer.from(structCreateThread.enc(rpcArgs)).toString('hex')

  console.log("payload", payload)

  return new Promise((resolve, reject) => {
    client.request(
      'nucleus_post',
      [nucleusId, 'post_thread', payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error)
          reject(new Error(response.error.message));
          return;
        }

        console.log("response.result", response.result)

        const result = decodeResult(response.result)
        console.log("result", result)

        if (result.status === 'error' || !result.data) {
          reject(new Error(result.message || 'unknown error'));
          return;
        }

        const threadId = result.data.toString(16)

        resolve(threadId);
      }
    );
  });
}