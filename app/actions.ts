'use server'

import { CreateCommunityArg, createCommunityRpc, CreateThreadArg, createThreadRpc } from "@/utils/aitonomy"

const nucleusId = 'kGk1FJCoPv4JTxez4aaWgGVaTPvsc2YPStz6ZWni4e61FVUW6';

export async function createCommunity(form: CreateCommunityArg) {
  const communityArgs = form

  const res = await createCommunityRpc(nucleusId, communityArgs)

  return res;
}

export async function createThread(form: CreateThreadArg) {
  const threadArgs = form

  const res = await createThreadRpc(nucleusId, threadArgs)

  return res;
}