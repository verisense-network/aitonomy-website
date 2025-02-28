import { useUserStore } from "@/store/user";
import { getWalletConnect } from "../wallet";
import { registry } from "./type";
import { Struct, u64 } from "@polkadot/types-codec";
import { CodecClass } from "@polkadot/types-codec/types";

export interface Signature {
  signature: Uint8Array;
  signer: Uint8Array;
  nonce: number;
}

export async function signPayload(
  payload: Record<string, any>,
  Struct: CodecClass<Struct<any>>
): Promise<Signature> {
  const user = useUserStore.getState();

  const wallet = getWalletConnect(user.wallet!);

  const nonce = 0;

  const nonceEncoded = new u64(registry, nonce).toU8a();
  const payloadEncoded = new Struct(registry, payload).toU8a();

  const messageBuf = new Uint8Array(
    nonceEncoded.length + payloadEncoded.length
  );
  messageBuf.set(nonceEncoded, 0);
  messageBuf.set(payloadEncoded, nonceEncoded.length);

  const message = Buffer.from(messageBuf).toString("hex");

  const signature = await wallet.signMessage(message);
  const signer = new Uint8Array(Object.values(user.publicKey));

  const verify = await wallet.verifySignature(message, signature, signer);

  console.log("verify", verify);

  return {
    signature,
    signer,
    nonce,
  };
}
