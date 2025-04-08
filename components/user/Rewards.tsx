import {
  Button,
  getKeyValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { getRewards } from "@/app/actions";
import { decodeRewards, Reward } from "@/utils/reward";
import {
  extractWagmiErrorDetailMessage,
  formatAddress,
  getAddressLink,
} from "@/utils/tools";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { readContract, writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmi";
import { useUser } from "@/hooks/useUser";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatReadableAmount } from "@/utils/format";
import { Community } from "@verisense-network/vemodel-types";

const TABLE_COLUMNS = [
  {
    key: "sequence",
    label: "Seq",
  },
  {
    key: "transfer",
    label: "Transfer",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "token_contract",
    label: "Contract",
  },
  {
    key: "actions",
    label: "Actions",
  },
];

const RewardABI = [
  {
    inputs: [
      { internalType: "bytes", name: "_messageBytes", type: "bytes" },
      { internalType: "bytes", name: "_signature", type: "bytes" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const UserTicketsABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "user_withdraws",
    outputs: [
      {
        internalType: "uint256[]",
        name: "",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

interface RewardsProps {
  communityId: string;
  agentContract: string;
  showTitle?: boolean;
  tokenInfo?: Community["token_info"];
}

export default function Rewards({
  communityId,
  agentContract,
  showTitle,
  tokenInfo,
}: RewardsProps) {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const {
    user: { address },
  } = useUser();

  const getUserRewards = useCallback(async () => {
    if (!address) return;
    setIsTableLoading(true);
    try {
      const { data, success } = await getRewards({
        accountId: address,
        communityId,
      });
      if (!success || !data) return;
      const list = decodeRewards(data);

      const tickets: bigint[] = (await readContract(wagmiConfig, {
        abi: UserTicketsABI,
        address: agentContract as `0x${string}`,
        functionName: "user_withdraws",
        args: [address],
      })) as unknown as bigint[];

      setRewards(
        list.map((reward) => {
          if (
            reward.sequence ===
            tickets.find((ticket) => ticket === reward.sequence)
          ) {
            return {
              ...reward,
              withdrawed: true,
            };
          }
          return reward;
        })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsTableLoading(false);
    }
  }, [address, communityId, agentContract]);

  const receiveReward = useCallback(
    async (reward: Reward) => {
      try {
        const _messageBytes = ethers.hexlify(new Uint8Array(reward.payload));
        console.log("_messageBytes", _messageBytes);
        const _signature = ethers.hexlify(new Uint8Array(reward.signature));
        console.log("_signature", _signature);

        const receipt = await writeContract(wagmiConfig, {
          abi: RewardABI,
          address: reward.agent_contract as `0x${string}`,
          functionName: "withdraw",
          args: [_messageBytes, _signature],
        });
        console.log("receipt", receipt);
        console.log("reward", reward);
        toast.success("receive success");
        getUserRewards();
      } catch (err: any) {
        console.error("receiveReward err", err);
        toast.error(`Failed: ${extractWagmiErrorDetailMessage(err)}`);
      }
    },
    [getUserRewards]
  );

  useEffect(() => {
    getUserRewards();
  }, [getUserRewards]);

  return (
    <div>
      {showTitle && <h1 className="text-md font-bold">Rewards</h1>}
      <Table>
        <TableHeader columns={TABLE_COLUMNS}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={decodeRewards(rewards)}
          emptyContent="No rewards"
          isLoading={isTableLoading}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow key={item.sequence}>
              {(columnKey) => {
                let cell: any = getKeyValue(item, columnKey);
                console.log("item", item);
                if (columnKey === "transfer") {
                  cell = (
                    <div className="flex space-x-2 items-center">
                      <Tooltip content={item.agent_contract}>
                        <Link
                          href={getAddressLink(item.agent_contract)}
                          target="_blank"
                        >
                          {formatAddress(item.agent_contract)}
                        </Link>
                      </Tooltip>
                      <ArrowRight className="w-4 h-4" />
                      <Tooltip content={item.address}>
                        <Link
                          href={getAddressLink(item.address)}
                          target="_blank"
                        >
                          {formatAddress(item.address)}
                        </Link>
                      </Tooltip>
                    </div>
                  );
                } else if (columnKey === "token_contract") {
                  cell = (
                    <Tooltip content={cell}>
                      <Link href={getAddressLink(cell)} target="_blank">
                        {formatAddress(cell)}
                      </Link>
                    </Tooltip>
                  );
                } else if (columnKey === "amount") {
                  cell = `${formatReadableAmount(cell, tokenInfo?.decimals)} ${
                    tokenInfo?.symbol
                  }`;
                } else if (columnKey === "actions") {
                  if (!item.withdrawed) {
                    cell = (
                      <Button size="sm" onPress={() => receiveReward(item)}>
                        Claim
                      </Button>
                    );
                  }
                }
                return <TableCell>{cell}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
