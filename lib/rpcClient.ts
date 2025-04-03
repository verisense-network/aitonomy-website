import { HttpProvider } from "@polkadot/rpc-provider";

const provider = new HttpProvider(
  `${process.env.AITONOMY_RPC_HOST}:${process.env.AITONOMY_RPC_PORT}`
);

export async function getRpcClient() {
  if (!provider.isConnected) {
    await provider.connect();
    console.log("provider reconnected");
    if (!provider.isConnected) {
      throw new Error("provider not connected");
    }
  }
  return provider;
}
