import { useUserStore } from "@/stores/user";

export function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isEqualAddress(agentPubkey: string, author: string) {
  return isEqual(agentPubkey?.toLowerCase(), author?.toLowerCase());
}

export function isYouAddress(address: string) {
  return isEqualAddress(address, useUserStore.getState().address);
}
