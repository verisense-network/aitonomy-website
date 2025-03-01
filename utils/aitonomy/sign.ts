import { useUserStore } from "@/store/user";
import { getWalletConnect } from "../wallet";
import { registry } from "./type";
import { Struct, u64 } from "@polkadot/types-codec";
import { CodecClass } from "@polkadot/types-codec/types";
import { getAccountInfo } from "@/app/actions";

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

  const accountInfo = await getAccountInfo({
    accountId: user.address,
  });
  if (!accountInfo.nonce) {
    throw new Error("nonce not found");
  }
  const nonce = Number(accountInfo.nonce);
  console.log("nonce", nonce);

  const nonceEncoded = new u64(registry, nonce).toU8a();
  const payloadEncoded = new Struct(registry, payload).toU8a();

  const messageBuf = new Uint8Array(
    nonceEncoded.length + payloadEncoded.length
  );
  messageBuf.set(nonceEncoded, 0);
  messageBuf.set(payloadEncoded, nonceEncoded.length);

  const message = Buffer.from(messageBuf).toString("hex");

  const signature = await wallet.signMessage(message);
  console.log("signature", signature);
  console.log("sig hex", Buffer.from(signature).toString("hex"));
  const signer = new Uint8Array(Object.values(user.publicKey));
  console.log("signer", signer);

  const verify = await wallet.verifySignature(message, signature, signer);

  console.log("verify", verify);

  return {
    signature,
    signer,
    nonce,
  };
}
