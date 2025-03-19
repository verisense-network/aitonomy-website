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
import { NAME_NOT_SET } from "@/utils/user";

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
  const [balances, setBalances] = useState<GetBalancesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isShowUpdateName, setIsShowUpdateName] = useState(false);
  const [userName, setUserName] = useState("");

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      const {
        success,
        data,
        message: errorMessage,
      } = await getAccountInfo({ accountId: address });
      if (!success || !data) {
        throw new Error(errorMessage);
      }
      setUserName(data.alias || NAME_NOT_SET);

      if (isYouAddress(address)) {
        const {
          success,
          data: balances,
          message: errorMessage,
        } = await getBalances({
          accountId: address,
          gt: undefined,
          limit: 10,
        });
        if (!success || !balances) {
          throw new Error(errorMessage);
        }
        setBalances(balances);
      }
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error(`Failed to get user profile: ${e}`);
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
    <div className="flex flex-col space-y-2 px-2">
      <h1 className="py-4 text-lg font-bold">Profile</h1>
      <Card>
        <CardBody>
          <div className="space-y-5">
            <div className="flex space-x-2 items-center">
              <label className="font-bold">Name:</label>
              {isLoading && <Spinner />}
              {isShowUpdateName ? (
                <UpdateAliasName
                  defaultName={userName}
                  onSuccess={updateAliasNameOnSuccess}
                  onClose={() => setIsShowUpdateName(false)}
                />
              ) : (
                <>
                  <span
                    className={userName !== NAME_NOT_SET ? "" : "text-gray-500"}
                  >
                    {userName || NAME_NOT_SET}
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
                  isLoading={isLoading}
                  loadingContent={<Spinner />}
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
