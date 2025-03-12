"use server";

import { getRpcClient } from "@/lib/rpcClient";

import {
  Account,
  AccountId,
  ActivateCommunityArg,
  Community,
  CommunityId,
  ContentId,
  CreateCommunityArg,
  LLmName,
  PostThreadArg,
  registry,
  PostCommentArg,
  SetAliasArg,
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

interface Signature {
  signature: Uint8Array;
  signer: Uint8Array;
  nonce: number;
}

export interface CreateCommunityArg {
  name: string;
  private: boolean;
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
  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "create_community",
      payload,
    ]);

    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<CommunityId, String>
     */
    const ResultStruct = Result.with({
      Ok: CommunityId,
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.asErr.toString());
    }

    const idHex = decoded.asOk.toHex();
    return idHex.slice(2);
  } catch (error: any) {
    console.error(error);
    throw new Error(error);
  }
}

export interface CreateThreadArg {
  community: string;
  title: string;
  content: Array<number>;
  images: string[];
  mention: Uint8Array[];
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

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "post_thread",
      payload,
    ]);

    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<ContentId, String>
     */
    const ResultStruct = Result.with({
      Ok: ContentId,
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.asErr.toString());
    }
    const idHex = decoded.asOk.toHex();
    console.log("idHex", idHex);
    return idHex;
  } catch (e) {
    throw e;
  }
}

export interface CreateCommentArg {
  thread: Uint8Array;
  content: Array<number>;
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

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "post_comment",
      payload,
    ]);

    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<ContentId, String>
     */
    const ResultStruct = Result.with({
      Ok: ContentId,
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.asErr.toString());
    }
    const idHex = decoded.asOk.toHex();
    return idHex.slice(2);
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export interface ActivateCommunityArg {
  community: string;
  tx: string;
}

export async function activateCommunityRpc(
  nucleusId: string,
  args: ActivateCommunityArg
) {
  const rpcArgs = {
    ...args,
    tx: ` ${args.tx}`,
  };

  console.log("rpcArgs", rpcArgs);

  const payload = new ActivateCommunityArg(registry, rpcArgs).toHex();

  console.log("payload", payload);

  const decoded = new ActivateCommunityArg(registry, payload).toHuman();
  console.log("decoded", decoded);

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "activate_community",
      payload,
    ]);

    console.log("response", response);
    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<(), String>
     */
    const ResultStruct = Result.with({
      Ok: Null,
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.toString());
    }
    const result = decoded.isOk && (decoded.asOk.toHuman() as any);
    console.log("result", result);

    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
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

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_balances",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<Vec<(Community, u64)>, String>
     */
    const ResultStruct = Result.with({
      Ok: Vec.with(Tuple.with([Community, u64])),
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.toString());
    }
    const result = decoded.asOk.toJSON() as any;
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export interface GetAccountInfoArg {
  account_id: Uint8Array;
}

export async function getAccountInfoRpc(
  nucleusId: string,
  args: GetAccountInfoArg
): Promise<{
  nonce: number;
  pubkey: string;
  alias?: string;
}> {
  console.log("args", args);
  const payload = new AccountId(registry, args.account_id).toHex();
  console.log("payload", payload);
  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_account_info",
      payload,
    ]);

    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<Account, String>
     */
    const ResultStruct = Result.with({
      Ok: Account,
      Err: Text,
    });
    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.toString());
    }
    const result = decoded.asOk.toJSON() as any;

    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export interface SetAliasArg {
  alias: string;
}

export async function setAliasRpc(
  nucleusId: string,
  args: SetAliasArg,
  signature: Signature
): Promise<string> {
  console.log("args", args);
  const rpcArgs = {
    ...signature,
    payload: args,
  };
  const payload = new SetAliasArg(registry, rpcArgs).toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "set_alias",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<(), String>
     */
    const ResultStruct = Result.with({
      Ok: Null,
      Err: Text,
    });
    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.toString());
    }
    const result = decoded.asOk.toHuman() as any;
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
