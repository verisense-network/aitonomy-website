'use server'

import { CreateCommunityArg, createCommunityRpc, CreateThreadArg, createThreadRpc } from "@/utils/aitonomy"
import { Signature } from "@/utils/aitonomy/sign";

const nucleusId = 'kGk1FJCoPv4JTxez4aaWgGVaTPvsc2YPStz6ZWni4e61FVUW6';

export async function createCommunity(form: CreateCommunityArg, signature: Signature) {
  const communityArgs = form

  const res = await createCommunityRpc(nucleusId, communityArgs, signature)

  return res;
}

export async function createThread(form: CreateThreadArg, signature: Signature) {
  const threadArgs = form

  const res = await createThreadRpc(nucleusId, threadArgs, signature)

  return res;
}