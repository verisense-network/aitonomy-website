import Jayson from "jayson";
import {
  Account,
  AccountId,
  ActivateCommunityArg,
  type CommunityStatus,
  Community,
  CommunityId,
  ContentId,
  CreateCommunityArg,
  LLmName,
  PostThreadArg,
  registry,
  Signature,
  PostCommentArg,
} from "./type";

import {
  Result,
  Option,
  Tuple,
  u32,
  Text,
  Null,
  Vec,
  u64,
} from "@polkadot/types-codec";

const client = Jayson.client.http({
  host: process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST,
  port: Number(process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT),
});

interface Signature {
  signature: Uint8Array;
  signer: Uint8Array;
  nonce: number;
}

export interface CreateCommunityArg {
  name: string;
  logo: string;
  slug: string;
  description: string;
  prompt: string;
  token: {
    symbol: string;
    total_issuance: number;
    decimals: number;
    image: string | null;
  };
  llm_name: LLmName;
  llm_api_host: string | null;
  llm_key: string | null;
}

export async function createCommunityRpc(
  nucleusId: string,
  args: CreateCommunityArg,
  signature: Signature
): Promise<string> {
  const rpcArgs = {
    ...signature,
    payload: args,
  };
  console.log("rpcArgs", rpcArgs);

  const payload = new CreateCommunityArg(registry, rpcArgs).toHex();
  console.log("payload", payload);

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_post",
      [nucleusId, "create_community", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response.result", response.result);

        const responseBytes = Buffer.from(response.result, "hex");

        /**
         * Result<CommunityId, String>
         */
        const ResultStruct = Result.with({
          Ok: CommunityId,
          Err: Text,
        });

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.asErr.toString()));
        } else if (decoded.isOk) {
          const idHex = decoded.asOk.toHex();
          resolve(idHex.slice(2));
        }
      }
    );
  });
}

export interface CreateThreadArg {
  community: string;
  title: string;
  content: string;
  image?: string;
  mention: string[];
}

export async function createThreadRpc(
  nucleusId: string,
  args: CreateThreadArg,
  signature: Signature
): Promise<string> {
  const rpcArgs = {
    ...signature,
    payload: args,
  };

  console.log("rpcArgs", rpcArgs);

  const payload = new PostThreadArg(registry, rpcArgs).toHex();

  console.log("payload", payload);

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_post",
      [nucleusId, "post_thread", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response", response);

        const responseBytes = Buffer.from(response.result, "hex");

        /**
         * Result<ContentId, String>
         */
        const ResultStruct = Result.with({
          Ok: ContentId,
          Err: Text,
        });

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.asErr.toString()));
        } else if (decoded.isOk) {
          const idHex = decoded.asOk.toHex();
          console.log("idHex", idHex);
          resolve(idHex);
        }
      }
    );
  });
}

export interface CreateCommentArg {
  thread: Uint8Array;
  content: string;
  image?: string;
  mention: string[];
  reply_to?: string;
}

export async function createCommentRpc(
  nucleusId: string,
  args: CreateCommentArg,
  signature: Signature
): Promise<string> {
  const rpcArgs = {
    ...signature,
    payload: args,
  };

  console.log("rpcArgs", rpcArgs);

  const payload = new PostCommentArg(registry, rpcArgs).toHex();

  console.log("payload", payload);

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_post",
      [nucleusId, "post_comment", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response", response);

        const responseBytes = Buffer.from(response.result, "hex");

        /**
         * Result<ContentId, String>
         */
        const ResultStruct = Result.with({
          Ok: ContentId,
          Err: Text,
        });

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.asErr.toString()));
        } else if (decoded.isOk) {
          const idHex = decoded.asOk.toHex();
          resolve(idHex.slice(2));
        }
      }
    );
  });
}

export interface ActivateCommunityArg {
  community: string;
  tx: string;
}

export async function activateCommunityRpc(
  nucleusId: string,
  args: ActivateCommunityArg
) {
  const rpcArgs = args;

  console.log("rpcArgs", rpcArgs);

  const payload = new ActivateCommunityArg(registry, rpcArgs).toHex();

  console.log("payload", payload);

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_post",
      [nucleusId, "activate_community", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error(response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response", response);

        const responseBytes = Buffer.from(response.result, "hex");

        /**
         * Result<(), String>
         */
        const ResultStruct = Result.with({
          Ok: Null,
          Err: Text,
        });

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.toString()));
        } else if (decoded.isOk) {
          const result = decoded.asOk.toHuman() as any;
          console.log("result", result);

          resolve(result);
        }
      }
    );
  });
}

export interface GetBalancesArg {
  account_id: Uint8Array;
  gt?: Uint8Array;
  limit: number;
}

export type GetBalancesResponse = [Community, number];

export async function getBalancesRpc(
  nucleusId: string,
  args: GetBalancesArg
): Promise<GetBalancesResponse[]> {
  console.log("args", args);
  /**
    account_id: AccountId,
    gt: Option<CommunityId>,
    limit: u32,
   */
  const tuple = new Tuple(
    registry,
    [AccountId, Option.with(CommunityId), u32],
    [args.account_id, args.gt, args.limit]
  );
  const payload = tuple.toHex();

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_get",
      [nucleusId, "get_balances", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error("res.err:", response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response", response);

        const responseBytes = Buffer.from(response.result, "hex");

        /**
         * Result<Vec<(Community, u64)>, String>
         */
        const ResultStruct = Result.with({
          Ok: Vec.with(Tuple.with([Community, u64])),
          Err: Text,
        });

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.toString()));
        } else if (decoded.isOk) {
          const result = decoded.asOk.toJSON() as any;
          resolve(result);
        }
      }
    );
  });
}

export interface GetAccountInfoArg {
  account_id: Uint8Array;
}

/**
 * Result<Option<Account>, String>
 */
const ResultStruct = Result.with({
  Ok: Option.with(Account),
  Err: Text,
});

export async function getAccountInfoRpc(
  nucleusId: string,
  args: GetAccountInfoArg
): Promise<{
  nonce: string;
  pubkey: string;
  alias?: string;
}> {
  console.log("args", args);
  const payload = new AccountId(registry, args.account_id).toHex();
  console.log("payload", payload);

  return new Promise((resolve, reject) => {
    client.request(
      "nucleus_get",
      [nucleusId, "get_account_info", payload],
      (err: any, response: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (response.error) {
          console.error("res.err:", response.error);
          reject(new Error(response.error.message));
          return;
        }

        console.log("response", response);

        const responseBytes = Buffer.from(response.result, "hex");

        const decoded = new ResultStruct(registry, responseBytes);

        if (decoded.isErr) {
          reject(new Error(decoded.toString()));
        }

        const result = decoded.asOk.toHuman() as any;

        resolve(result);
      }
    );
  });
}
