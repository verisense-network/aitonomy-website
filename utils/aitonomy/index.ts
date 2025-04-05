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
  RewardPayload,
  InviteUserArg,
  GenerateInviteTicketArg,
} from "@verisense-network/vemodel-types";
import {
  Result,
  Option,
  Tuple,
  u32,
  Text,
  Null,
  Vec,
  u64,
  Bool,
  Enum,
  u128,
} from "@verisense-network/vemodel-types/dist/codec";

interface Signature {
  signature: Uint8Array;
  signer: Uint8Array;
  nonce: number;
}

export interface CreateCommunityArg {
  name: string;
  mode: Enum;
  logo: string;
  slug: string;
  description: string;
  prompt: string;
  token: {
    name: string;
    symbol: string;
    total_issuance: bigint;
    decimals: number;
    new_issue: boolean;
    contract: string | null;
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
  mention: Uint8Array[];
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

export interface GetRewardsArg {
  community_id: Uint8Array;
  account_id: Uint8Array;
}

export type GetRewardsResponse = {
  payload: Uint8Array;
  signature: Uint8Array;
  agent_contract: AccountId;
  token_contract: AccountId;
  token_symbol: string;
  withdrawed: boolean;
};

export async function getRewardsRpc(
  nucleusId: string,
  args: GetRewardsArg
): Promise<GetRewardsResponse[]> {
  console.log("args", args);
  /**
    community_id: CommunityId, account_id: AccountId
   */

  const tuple = new Tuple(
    registry,
    [CommunityId, AccountId],
    [args.community_id, args.account_id]
  );
  const payload = tuple.toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_reward_payloads",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Vec<RewardPayload>
     */
    const ResultStruct = Vec.with(RewardPayload);

    const decoded = new ResultStruct(registry, responseBytes);

    if (!decoded) {
      throw new Error("Failed to decode rewards");
    }
    const result = decoded.toJSON() as unknown as GetRewardsResponse[];
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export interface GetAccountInfoArg {
  account_id: Uint8Array;
}

export interface GetAccountInfoResponse {
  nonce: number;
  address: string;
  alias?: string;
  max_invite_block: number;
  last_post_at: number;
}

export async function getAccountInfoRpc(
  nucleusId: string,
  args: GetAccountInfoArg
): Promise<GetAccountInfoResponse> {
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

export interface GetAccountsArg {
  account_ids: Uint8Array[];
}

export async function getAccountsRpc(nucleusId: string, args: GetAccountsArg) {
  console.log("args", args);
  const payload = new Vec(registry, AccountId, args.account_ids).toHex();
  console.log("payload", payload);
  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_accounts",
      payload,
    ]);

    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<Vec<Account>, String>
     */
    const ResultStruct = Result.with({
      Ok: Vec.with(Account),
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

export interface GetCommunityArg {
  id: Uint8Array;
}

export async function getCommunityRpc(
  nucleusId: string,
  args: GetCommunityArg
) {
  console.log("args", args);
  const communityId = new CommunityId(registry, args.id);
  const payload = communityId.toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_community",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * Result<Option<Community>, String>
     */
    const ResultStruct = Result.with({
      Ok: Option.with(Community),
      Err: Text,
    });

    const decoded = new ResultStruct(registry, responseBytes);

    if (decoded.isErr) {
      throw new Error(decoded.toString());
    }
    const result = decoded.asOk.toJSON() as any;
    console.log("getCommunityRpc result", result);
    return result;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export interface InviteUserArg {
  community: string;
  invitee: string;
}

export async function inviteUserRpc(
  nucleusId: string,
  args: InviteUserArg,
  signature: Signature
): Promise<string> {
  console.log("args", args);
  const rpcArgs = {
    ...signature,
    payload: args,
  };
  const payload = new InviteUserArg(registry, rpcArgs).toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "invite_user",
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

export interface CheckPermissionArg {
  community_id: Uint8Array;
  account_id: Uint8Array;
}
export async function checkPermissionRpc(
  nucleusId: string,
  args: CheckPermissionArg
): Promise<boolean> {
  console.log("args", args);
  /**
   * (community_id: CommunityId, user: AccountId)
   */
  const tuple = new Tuple(
    registry,
    [CommunityId, AccountId],
    [args.community_id, args.account_id]
  );
  const payload = tuple.toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "check_permission",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * bool
     */
    const ResultStruct = Bool;
    const decoded = new ResultStruct(registry, responseBytes);

    const result = decoded.toHuman() as boolean;
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export async function getInviteFeeRpc(
  nucleusId: string,
  args: string
): Promise<bigint> {
  const payload = new Text(registry, args).toHex();
  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_invite_fee",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * u128
     */
    const ResultStruct = u128;
    const decoded = new ResultStruct(registry, responseBytes);

    const result = decoded.toBigInt();
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}

export interface GenerateInviteTicketArg {
  community_id: Uint8Array;
  tx: string;
}

export async function generateInviteTicketsRpc(
  nucleusId: string,
  args: GenerateInviteTicketArg
): Promise<string> {
  console.log("args", args);

  const rpcArgs = args;
  const payload = new GenerateInviteTicketArg(registry, rpcArgs).toHex();

  console.log("payload", payload);

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_post", [
      nucleusId,
      "generate_invite_tickets",
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

export interface getInviteTicketsArg {
  community_id: Uint8Array;
  account_id: Uint8Array;
}

export async function getInviteTicketsRpc(
  nucleusId: string,
  args: getInviteTicketsArg
): Promise<bigint> {
  console.log("args", args);
  /**
   * (community_id: CommunityId, user: AccountId)
   */
  const tuple = new Tuple(
    registry,
    [CommunityId, AccountId],
    [args.community_id, args.account_id]
  );
  const payload = tuple.toHex();

  try {
    const provider = await getRpcClient();
    const response = await provider.send<any>("nucleus_get", [
      nucleusId,
      "get_invite_tickets",
      payload,
    ]);
    console.log("response", response);

    const responseBytes = Buffer.from(response, "hex");

    /**
     * u64
     */
    const ResultStruct = u64;
    const decoded = new ResultStruct(registry, responseBytes);

    const result = decoded.toBigInt();
    console.log("result", result);
    return result;
  } catch (err: any) {
    console.error(err);
    throw err;
  }
}
