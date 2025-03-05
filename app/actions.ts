"use server";

import uploadImageWithPostImages from "@/lib/uploadImage";
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
  SetAliasArg,
  setAliasRpc,
} from "@/utils/aitonomy";
import { Signature } from "@/utils/aitonomy/sign";
import { NUCLEUS_ID } from "@/utils/aitonomy/tools";
import { hexToBytes } from "@/utils/tools";
import bs58 from "bs58";

if (!NUCLEUS_ID) {
  throw new Error("Nucleus ID is not defined");
}

export async function uploadImage(file: File) {
  return uploadImageWithPostImages(file);
}

export async function createCommunity(
  form: CreateCommunityArg,
  signature: Signature
) {
  const communityArgs = form;

  const res = await createCommunityRpc(NUCLEUS_ID, communityArgs, signature);

  return res;
}

export async function createThread(
  form: CreateThreadArg,
  signature: Signature
) {
  const threadArgs = form;

  const res = await createThreadRpc(NUCLEUS_ID, threadArgs, signature);

  return res;
}

export async function createComment(
  form: CreateCommentArg,
  signature: Signature
) {
  const commentArgs = form;

  const res = await createCommentRpc(NUCLEUS_ID, commentArgs, signature);

  return res;
}

export async function activateCommunity(data: ActivateCommunityArg) {
  const threadArgs = data;

  const res = await activateCommunityRpc(NUCLEUS_ID, threadArgs);

  return res;
}

interface GetAccountInfoParams {
  accountId: string;
}

export async function getAccountInfo(data: GetAccountInfoParams) {
  const threadArgs = {
    account_id: bs58.decode(data.accountId),
  };

  const res = await getAccountInfoRpc(NUCLEUS_ID, threadArgs);

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

  const res = await getBalancesRpc(NUCLEUS_ID, threadArgs);

  return res;
}

export async function setAlias(data: SetAliasArg, signature: Signature) {
  const threadArgs = data;

  const res = await setAliasRpc(NUCLEUS_ID, threadArgs, signature);

  return res;
}
