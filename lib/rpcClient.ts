import { HttpProvider } from "@polkadot/rpc-provider";

const provider = new HttpProvider(
  `${process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST}:${process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT}`
);

provider.on("connected", () => {
  console.log("provider connected");
});

provider.on("error", (error: any) => {
  console.error("provider error", error);
});

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
