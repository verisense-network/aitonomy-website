import Jayson from "jayson";

const client = Jayson.client.http({
  host: process.env.NEXT_PUBLIC_AITONOMY_RPC_HOST,
  port: Number(process.env.NEXT_PUBLIC_AITONOMY_RPC_PORT),
});

export default client;
