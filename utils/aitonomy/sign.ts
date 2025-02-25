import { useUserStore } from "@/store/user";
import { getWalletConnect } from "../wallet";
import { hexToU8a } from "../tools";

export interface Signature {
  signature: Uint8Array
  signer: Uint8Array
  nonce: bigint
}

export async function signPayload(payload: Record<string, any>): Promise<Signature> {
  const user = useUserStore.getState()

  const wallet = getWalletConnect(user.wallet!)

  const signature = await wallet.signPayload(payload, user.address)
  const signer = user.publicKey
  const hexSigner = Buffer.from(signer, 'base64').toString('hex')

  return {
    signature: hexToU8a(signature),
    signer: hexToU8a(hexSigner),
    nonce: 0n
  }
}