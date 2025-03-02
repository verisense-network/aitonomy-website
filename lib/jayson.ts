import Jayson from "jayson";

let client: Jayson.Client;

const isProduction = process.env.NODE_ENV === "production";
if (isProduction) {
  client = Jayson.client.websocket({
    url: `${process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST}:${process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT}`,
  });
} else {
  client = Jayson.client.http({
    host: process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST,
    port: Number(process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT),
  });
}

export default client;
