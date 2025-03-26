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
import { formatAddress } from "@/utils/tools";
import { getWalletConnect } from "@/utils/wallet";
import { toast } from "react-toastify";
import { ethers } from "ethers";

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

export default function Rewards() {
  const [isLoading, setIsLoading] = useState(false);
  const [rewards, setRewards] = useState<GetRewardsResponse[]>([]);

  const { address, wallet: walletId } = useUserStore();

  const getUserRewards = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const { data, success } = await getRewards({ accountId: address });
      if (!success || !data) return;
      setRewards(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  const receiveReward = useCallback(
    async (reward: Reward) => {
      try {
        const wallet = getWalletConnect(walletId);

        console.log("reward", reward);
        console.log("wallet", wallet);

        const _messageBytes = ethers.hexlify(new Uint8Array(reward.payload));
        console.log("_messageBytes", _messageBytes);
        const _signature = ethers.hexlify(new Uint8Array(reward.signature));
        console.log("_signature", _signature);

        const receipt = await wallet.callWithdraw(
          reward.contract,
          _messageBytes,
          _signature
        );
        console.log("receipt", receipt);
        console.log("reward", reward);
        toast.success("receive success");
      } catch (err: any) {
        console.error("receiveReward err", err);
        toast.error(`Failed: ${err}`);
      }
    },
    [walletId]
  );

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
          isLoading={isLoading}
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
