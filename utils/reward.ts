import { AbiCoder } from "ethers";
import { GetRewardsResponse } from "./aitonomy";

export interface Reward extends GetRewardsResponse {
  payload: Uint8Array;
  sequence: bigint;
  address: string;
  amount: bigint;
  signature: Uint8Array;
}

export function decodeRewards(rewards: GetRewardsResponse[]): Reward[] {
  const abiCoder = new AbiCoder();

  const list = rewards.map((reward) => {
    const [sequence, address, amount] = abiCoder.decode(
      ["uint256", "address", "uint256"],
      `0x${Buffer.from(reward.payload).toString("hex")}`
    );

    return {
      ...reward,
      sequence,
      address,
      amount,
    };
  });

  return list;
}
