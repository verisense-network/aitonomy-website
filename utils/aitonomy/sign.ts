import { useUserStore } from "@/stores/user";
import { registry } from "@verisense-network/vemodel-types";
import { Struct, u64 } from "@verisense-network/vemodel-types/dist/codec";
import { CodecClass } from "@polkadot/types-codec/types";
import { getAccountInfo } from "@/app/actions";
import { signMessage, verifyMessage } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmi";
import { hexToBytes } from "../tools";

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

  const {
    success,
    data: account,
    message: errorMessage,
  } = await getAccountInfo({
    accountId: user.address,
  });
  if (!success || !account) {
    throw new Error(`Failed: ${errorMessage}`);
  }
  console.log("accountInfo", account);
  if (account.nonce === undefined || account.nonce === null) {
    throw new Error("nonce not found");
  }
  const nonce = account.nonce;
  console.log("nonce", nonce);

  const nonceEncoded = new u64(registry, nonce).toU8a();
  console.log("nonceEncoded", nonceEncoded);
  console.log("payload", payload);
  const payloadEncoded = new Struct(registry as any, payload).toU8a();

  const messageBuf = new Uint8Array(
    nonceEncoded.length + payloadEncoded.length
  );
  messageBuf.set(nonceEncoded, 0);
  messageBuf.set(payloadEncoded, nonceEncoded.length);

  const message = Buffer.from(messageBuf).toString("hex");

  console.log("call sign");

  const signature = await signMessage(wagmiConfig, { message });
  console.log("signature", signature);
  console.log("sig hex", Buffer.from(signature).toString("hex"));
  const signer = new Uint8Array(Object.values(user.publicKey));
  console.log("signer", signer);

  const verify = await verifyMessage(wagmiConfig, {
    address: `0x${Buffer.from(signer).toString("hex")}`,
    message: message,
    signature,
  });

  console.log("verify", verify);

  return {
    signature: hexToBytes(signature),
    signer,
    nonce,
  };
}
