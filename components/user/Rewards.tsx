import { useUserStore } from "@/stores/user";
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
import { GetRewardsResponse } from "@/utils/aitonomy";
import { getRewards } from "@/app/actions";
import { decodeRewards, Reward } from "@/utils/reward";
import { extractWagmiErrorDetailMessage, formatAddress } from "@/utils/tools";
import { toast } from "react-toastify";
import { ethers } from "ethers";
import { writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmi";
import { useUser } from "@/hooks/useUser";

const TABLE_COLUMNS = [
  {
    key: "sequence",
    label: "Seq",
  },
  {
    key: "address",
    label: "Receive Address",
  },
  {
    key: "amount",
    label: "Amount",
  },
  {
    key: "contract",
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

export default function Rewards() {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [rewards, setRewards] = useState<GetRewardsResponse[]>([]);

  const {
    user: { address },
  } = useUser();

  const getUserRewards = useCallback(async () => {
    if (!address) return;
    setIsTableLoading(true);
    try {
      const { data, success } = await getRewards({ accountId: address });
      if (!success || !data) return;
      setRewards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsTableLoading(false);
    }
  }, [address]);

  const receiveReward = useCallback(async (reward: Reward) => {
    try {
      const _messageBytes = ethers.hexlify(new Uint8Array(reward.payload));
      console.log("_messageBytes", _messageBytes);
      const _signature = ethers.hexlify(new Uint8Array(reward.signature));
      console.log("_signature", _signature);

      const receipt = await writeContract(wagmiConfig, {
        abi: RewardABI,
        address: reward.contract as `0x${string}`,
        functionName: "withdraw",
        args: [_messageBytes, _signature],
      });
      console.log("receipt", receipt);
      console.log("reward", reward);
      toast.success("receive success");
    } catch (err: any) {
      console.error("receiveReward err", err);
      toast.error(`Failed: ${extractWagmiErrorDetailMessage(err)}`);
    }
  }, []);

  useEffect(() => {
    getUserRewards();
  }, [getUserRewards]);

  return (
    <div>
      <h1 className="text-md font-bold">Rewards</h1>
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
                if (["address", "contract"].includes(columnKey as any)) {
                  cell = (
                    <Tooltip content={cell}>{formatAddress(cell)}</Tooltip>
                  );
                } else if (columnKey === "actions") {
                  cell = (
                    <Button size="sm" onPress={() => receiveReward(item)}>
                      Receive
                    </Button>
                  );
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
