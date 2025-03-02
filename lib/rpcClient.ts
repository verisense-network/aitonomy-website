import { WsProvider } from "@polkadot/rpc-provider";

const provider = new WsProvider(
  `${process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST}:${process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT}`
);

provider.on("connected", () => {
  console.log("provider connected");
});

provider.on("error", (error: any) => {
  console.error("provider error", error);
});

export async function getRpcClient() {
  if (!(await provider.isReady)) {
    await provider.connectWithRetry();
    console.log("provider reconnected");
    if (!(await provider.isReady)) {
      await provider.connectWithRetry();
      throw new Error("provider not connected");
    }
  }
  return provider;
}
