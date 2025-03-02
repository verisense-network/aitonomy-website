import Jayson from "jayson";

const client = Jayson.client.http({
  host: process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST,
  port: Number(process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT),
});

client.on("open", () => {
  console.log("Jayson Connection opened");
});
client.on("error", (error) => {
  console.error("Jayson Connection error", error);
});
client.on("close", () => {
  console.log("Jayson Connection closed");
});

console.log("client", (client as any).options);

export default client;
