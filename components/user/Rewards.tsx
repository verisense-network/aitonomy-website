import { useUserStore } from "@/stores/user";
import {
  getKeyValue,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { GetRewardsResponse } from "@/utils/aitonomy";
import { getRewards } from "@/app/actions";

const TABLE_COLUMNS = [
  {
    key: "title",
    label: "Title",
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

  const { address } = useUserStore();

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
          items={rewards?.map((r) => ({
            title: r.payload,
            contract: r.agent_contract,
          }))}
          emptyContent="No rewards"
          isLoading={isLoading}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow key={item.contract}>
              {(columnKey) => {
                const cell = getKeyValue(item, columnKey);
                return <TableCell>{cell}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
