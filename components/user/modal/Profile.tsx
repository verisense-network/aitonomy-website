import { getAccountInfo, getBalances, setAlias } from "@/app/actions";
import { useUserStore } from "@/store/user";
import { GetBalancesResponse } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { Community, SetAliasPayload } from "@/utils/aitonomy/type";
import { formatAddress } from "@/utils/tools";
import {
  Button,
  getKeyValue,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
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

export default function UserProfile({ isOpen, onClose }: Props) {
  const { name, address } = useUserStore();
  const [accountName, setAccountName] = useState<string>("");
  const [balances, setBalances] = useState<GetBalancesResponse[]>([]);

  const getUserProfile = useCallback(async () => {
    if (!address) return;
    const account = await getAccountInfo({
      accountId: address,
    });
    setAccountName(account?.alias || name || address);
    const balances = await getBalances({
      accountId: address,
      gt: undefined,
      limit: 10,
    });
    setBalances(balances);
  }, [address, name]);

  const updateAccountName = useCallback(async () => {
    const payload = {
      alias: "hello_world",
    };
    const signature = await signPayload(payload, SetAliasPayload);
    // console.log("signature", signature);
    const res = await setAlias(payload, signature);
    console.log("res", res);
    // setAccountName(account?.alias || name || address);
  }, []);

  useEffect(() => {
    if (!address || !isOpen) return;
    getUserProfile();
  }, [address, getUserProfile, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Profile</ModalHeader>
            <ModalBody>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <label>Name:</label>
                  <span>{accountName}</span>
                  <Button onPress={updateAccountName}>Update Name</Button>
                </div>
                <div className="flex space-x-2">
                  <label>Address:</label>
                  <span>{formatAddress(address)}</span>
                </div>
              </div>
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
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
