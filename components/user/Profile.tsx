import { getAccountInfo, getBalances } from "@/app/actions";
import { GetBalancesResponse } from "@/utils/aitonomy";
import { Community } from "@/utils/aitonomy/type";
import { formatAddress } from "@/utils/tools";
import {
  Button,
  Card,
  CardBody,
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

const NAME_NOT_SET = "Name not set";

export default function UserProfile({ address }: Props) {
  const [balances, setBalances] = useState<GetBalancesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowUpdateName, setIsShowUpdateName] = useState(false);
  const [userName, setUserName] = useState("");

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);

      const account = await getAccountInfo({
        accountId: address,
      });
      console.log("account", account);
      const aliasName = account?.alias || NAME_NOT_SET;
      setUserName(aliasName);

      if (isYouAddress(address)) {
        const balances = await getBalances({
          accountId: address,
          gt: undefined,
          limit: 10,
        });
        setBalances(balances);
      }
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
    <div className="flex flex-col space-y-2 px-2 md:w-1/2">
      <h1 className="py-4 text-lg font-bold">Profile</h1>
      <Card className="min-w-1/2">
        <CardBody>
          <div className="space-y-5">
            <div className="flex space-x-2 items-center">
              <label className="font-bold">Name:</label>
              {isLoading && <Spinner />}
              {isShowUpdateName ? (
                <UpdateAliasName
                  defaultName={userName === NAME_NOT_SET ? "" : userName}
                  onSuccess={updateAliasNameOnSuccess}
                  onClose={() => setIsShowUpdateName(false)}
                />
              ) : (
                <>
                  <span
                    className={`${
                      userName === NAME_NOT_SET && "text-gray-500"
                    }`}
                  >
                    {userName}
                  </span>
                  {isYouAddress(address) && (
                    <Button onPress={updateAccountName} size="sm">
                      Update Name
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <label className="font-bold">Address:</label>
              <Tooltip content={address}>
                <span>{formatAddress(address)}</span>
              </Tooltip>
            </div>
            {isYouAddress(address) && (
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
