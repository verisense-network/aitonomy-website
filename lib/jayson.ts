import Jayson from "jayson";

let client: Jayson.WebsocketClient | Jayson.HttpClient;

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  client = Jayson.client.websocket({
    url: `${process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST}:${process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT}`,
  });
  const wsClient = client as any;
  (wsClient.ws as any).on("open", () => {
    console.log("Jayson Connection opened");
  });
  (wsClient.ws as any).on("error", (error: any) => {
    console.error("Jayson Connection error", error);
  });
  (wsClient.ws as any).on("close", () => {
    console.log("Jayson Connection closed");
  });
} else {
  client = Jayson.client.http({
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
}

console.log("client", (client as any).options);

export default client;
