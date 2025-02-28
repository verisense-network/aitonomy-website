"use server";

import {
  ActivateCommunityArg,
  activateCommunityRpc,
  CreateCommentArg,
  createCommentRpc,
  CreateCommunityArg,
  createCommunityRpc,
  CreateThreadArg,
  createThreadRpc,
  getAccountInfoRpc,
  getBalancesRpc,
} from "@/utils/aitonomy";
import { Signature } from "@/utils/aitonomy/sign";
import { hexToBytes } from "@/utils/tools";
import bs58 from "bs58";

const nucleusId = "kGk1FJCoPv4JTxez4aaWgGVaTPvsc2YPStz6ZWni4e61FVUW6";

export async function createCommunity(
  form: CreateCommunityArg,
  signature: Signature
) {
  const communityArgs = form;

  const res = await createCommunityRpc(nucleusId, communityArgs, signature);

  return res;
}

export async function createThread(
  form: CreateThreadArg,
  signature: Signature
) {
  const threadArgs = form;

  const res = await createThreadRpc(nucleusId, threadArgs, signature);

  return res;
}

export interface CreateCommentParams {
  thread: string;
  content: string;
  image?: string;
  mention: string[];
  reply_to?: string;
}

export async function createComment(
  form: CreateCommentParams,
  signature: Signature
) {
  const commentArgs = {
    ...form,
    thread: hexToBytes(form.thread),
  };

  const res = await createCommentRpc(nucleusId, commentArgs, signature);

  return res;
}

export async function activateCommunity(data: ActivateCommunityArg) {
  const threadArgs = data;

  const res = await activateCommunityRpc(nucleusId, threadArgs);

  return res;
}

interface GetAccountInfoParams {
  accountId: string;
}

export async function getAccountInfo(data: GetAccountInfoParams) {
  const threadArgs = {
    account_id: bs58.decode(data.accountId),
  };

  const res = await getAccountInfoRpc(nucleusId, threadArgs);

  return res;
}

interface GetBalancesParams {
  accountId: string;
  gt?: string;
  limit: number;
}

export async function getBalances(data: GetBalancesParams) {
  console.log("data", data);
  const threadArgs = {
    account_id: bs58.decode(data.accountId),
    gt: data.gt ? hexToBytes(data.gt) : undefined,
    limit: data.limit,
  };

  const res = await getBalancesRpc(nucleusId, threadArgs);

  return res;
}
