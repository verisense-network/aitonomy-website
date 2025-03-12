import { useUserStore } from "@/store/user";

export function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isAgentAddress(agentPubkey: string, author: string) {
  return isEqual(agentPubkey?.toLowerCase(), author?.toLowerCase());
}

export function isYouAddress(address: string) {
  return isEqual(
    address?.toLowerCase(),
    useUserStore.getState().address?.toLowerCase()
  );
}
