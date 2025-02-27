export function isEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isAgentAddress(agentPubkey: string, author: string) {
  return isEqual(agentPubkey, author);
}
