import { getBalances } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { GetBalancesResponse } from "@/utils/aitonomy";
import { Community } from "@verisense-network/vemodel-types";
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
import { toast } from "react-toastify";

const TABLE_COLUMNS = [
  {
    key: "community",
    label: "Community",
  },
  {
    key: "balance",
    label: "Balance",
  },
];

export default function Balances() {
  const [isLoading, setIsLoading] = useState(false);
  const [balances, setBalances] = useState<GetBalancesResponse[]>([]);
  const { address } = useUserStore();

  const getUserBalances = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      const {
        success,
        data,
        message: errorMessage,
      } = await getBalances({
        accountId: address,
        gt: undefined,
        limit: 10,
      });
      if (!success || !data) {
        throw new Error(errorMessage);
      }
      setBalances(data);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to get user balances: ${e}`);
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    getUserBalances();
  }, [getUserBalances, address]);

  return (
    <div>
      <h1 className="text-md font-bold">Balances</h1>
      <Table aria-label="Balances">
        <TableHeader columns={TABLE_COLUMNS}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={balances?.map((b) => ({
            community: b[0],
            balance: b[1],
          }))}
          emptyContent="No balances"
          isLoading={isLoading}
          loadingContent={<Spinner />}
        >
          {(item) => (
            <TableRow key={item.community.name}>
              {(columnKey) => {
                const cell = getKeyValue(item, columnKey);
                const community = getKeyValue(item, "community") as Community;
                let value = cell;
                if (columnKey === "community") {
                  value = community.name;
                } else if (columnKey === "balance") {
                  value = `${cell} ${community?.token_info?.symbol}`;
                }
                return <TableCell>{value}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
