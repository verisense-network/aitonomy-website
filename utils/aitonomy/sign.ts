import { useUserStore } from "@/store/user";
import { getWalletConnect } from "../wallet";

export interface Signature {
  signature: Uint8Array;
  signer: Uint8Array;
  nonce: number;
}

export async function signPayload(
  payload: Record<string, any>
): Promise<Signature> {
  const user = useUserStore.getState();

  const wallet = getWalletConnect(user.wallet!);

  const signature = await wallet.signPayload(payload);
  const signer = new Uint8Array(Object.values(user.publicKey));

  return {
    signature,
    signer,
    nonce: 0,
  };
}
