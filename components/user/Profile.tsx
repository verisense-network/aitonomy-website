import { getBalances } from "@/app/actions";
import { useUserStore } from "@/store/user";
import { GetBalancesResponse } from "@/utils/aitonomy";
import { Community } from "@/utils/aitonomy/type";
import { formatAddress } from "@/utils/tools";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
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
import UpdateAliasName from "./UpdateAliasName";
import { toast } from "react-toastify";
import { isYouAddress } from "../thread/utils";

interface Props {
  address: string;
}

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

export default function UserProfile({ address }: Props) {
  const { name, address: currentAddress } = useUserStore();
  const [balances, setBalances] = useState<GetBalancesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowUpdateName, setIsShowUpdateName] = useState(false);

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      const balances = await getBalances({
        accountId: address,
        gt: undefined,
        limit: 10,
      });
      setBalances(balances);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to get user profile");
      setIsLoading(false);
    }
  }, [address]);

  const updateAccountName = useCallback(async () => {
    setIsShowUpdateName(true);
  }, []);

  const updateAliasNameOnSuccess = useCallback(() => {
    setIsShowUpdateName(false);
    getUserProfile();
  }, [getUserProfile]);

  useEffect(() => {
    if (!address) return;
    getUserProfile();
  }, [address, getUserProfile]);

  return (
    <div className="flex flex-col space-y-2">
      <Card>
        <CardHeader>Profile</CardHeader>
        <CardBody>
          <div className="space-y-2">
            <div className="flex space-x-2 items-center">
              <label className="font-bold">Name:</label>
              {isLoading && <Spinner />}
              {isShowUpdateName ? (
                <UpdateAliasName
                  defaultName={name}
                  onSuccess={updateAliasNameOnSuccess}
                  onClose={() => setIsShowUpdateName(false)}
                />
              ) : isYouAddress(address) ? (
                <>
                  <span>{name}</span>
                  <Button onPress={updateAccountName} size="sm">
                    Update Name
                  </Button>
                </>
              ) : null}
            </div>
            <div className="flex space-x-2">
              <label className="font-bold">Address:</label>
              <Tooltip content={address}>
                <span>{formatAddress(address)}</span>
              </Tooltip>
            </div>
            {isYouAddress(address) && (
              <Table aria-label="Balances" title="Balances">
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
                >
                  {(item) => (
                    <TableRow key={item.community.name}>
                      {(columnKey) => {
                        const cell = getKeyValue(item, columnKey);
                        const community = getKeyValue(
                          item,
                          "community"
                        ) as Community;
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
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
