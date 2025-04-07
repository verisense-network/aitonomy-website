import { useUserStore } from "@/stores/user";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { useCallback, useMemo, useState } from "react";
import { Id, toast } from "react-toastify";
import { formatReadableAmount } from "@/utils/format";
import { abiTransfer } from "@/utils/abis";
import { isDev } from "@/utils/tools";
import { simulateContract, writeContract } from "@wagmi/core";
import { wagmiConfig } from "@/config/wagmi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  community: any;
  toAddress: string;
  amount: string;
  onSuccess: (success: boolean, toastId: Id) => void;
}

export default function TransferTokenModal({
  isOpen,
  onClose,
  community,
  toAddress,
  amount,
  onSuccess,
}: Props) {
  const { address } = useUserStore();
  const fromAddress = address;
  const [isLoading, setIsLoading] = useState(false);

  const toPay = useCallback(async () => {
    if (!amount || Number.isNaN(Number(amount))) {
      toast.error("Invalid amount");
      return;
    }

    const toastId = toast.loading(
      "Posting continue to complete in your wallet"
    );
    try {
      setIsLoading(true);
      const tokenContract = community?.token_info?.contract;

      const { request } = await simulateContract(wagmiConfig, {
        abi: abiTransfer,
        address: tokenContract,
        functionName: "transfer",
        args: [toAddress as `0x${string}`, BigInt(amount)],
      });
      const hash = await writeContract(wagmiConfig, request);

      onSuccess(!!hash, toastId);
      setIsLoading(false);
    } catch (e: any) {
      console.error("Error paying", e);
      setIsLoading(false);
      toast.update(toastId, {
        render: `Error paying: ${e.message}`,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  }, [amount, toAddress, community?.token_info?.contract, onSuccess]);

  const mockPayment = useCallback(() => {
    onSuccess(true, 1);
  }, [onSuccess]);

  const listData = useMemo(() => {
    return [
      {
        label: "From Address",
        value: fromAddress,
      },
      {
        label: "To Address",
        value: toAddress,
      },
      {
        label: "Amount",
        value: `${
          amount
            ? formatReadableAmount(amount, community?.token_info?.decimals)
            : ""
        } ${community?.token_info?.symbol}`,
      },
    ];
  }, [fromAddress, toAddress, amount, community?.token_info]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transfer Token</ModalHeader>
            <ModalBody>
              <Card>
                <CardBody>
                  <div className="space-y-2">
                    {listData.map((item) => (
                      <div key={item.label}>
                        <span className="text-sm font-bold">
                          {item.label}:{" "}
                        </span>
                        <span className="text-sm">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
              <Button
                onPress={toPay}
                disabled={isLoading}
                isLoading={isLoading}
              >
                Transfer
              </Button>
              {isDev && <Button onPress={mockPayment}>Mock</Button>}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
