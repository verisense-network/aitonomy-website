import { useUserStore } from "@/store/user";
import { getWalletConnect } from "@/utils/wallet";
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
import bs58 from "bs58";
import { Id, toast } from "react-toastify";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";
import { chain } from "@/utils/chain";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  toAddress: string;
  amount: string;
  onSuccess: (tx: string, toastId: Id) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  toAddress,
  amount,
  onSuccess,
}: Props) {
  const { address, wallet } = useUserStore();
  const fromAddress = address;
  const [isLoading, setIsLoading] = useState(false);

  const toPay = useCallback(async () => {
    const toastId = toast.loading(
      "Posting continue to complete in your wallet"
    );
    try {
      setIsLoading(true);
      const walletConnect = getWalletConnect(wallet);
      const readableAmount = formatReadableAmount(amount);
      console.log("toAddress", toAddress);
      console.log("readableAmount", readableAmount);
      const tx = await walletConnect.createTransaction(
        toAddress,
        readableAmount
      );
      console.log("tx", tx);
      const signTx = await walletConnect.signTransaction(tx as any);

      console.log("signTx", signTx);

      await walletConnect.broadcastTransaction(signTx);

      const signatureHex =
        chain === "sol" ? bs58.encode(signTx.signature) : signTx;
      onSuccess(signatureHex, toastId);
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
  }, [wallet, toAddress, amount, onSuccess]);

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
        value: `${amount ? formatReadableAmount(amount) : ""} ${VIEW_UNIT}`,
      },
    ];
  }, [fromAddress, toAddress, amount]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transaction</ModalHeader>
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
                Payment
              </Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
