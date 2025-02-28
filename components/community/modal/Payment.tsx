import { useUserStore } from "@/store/user";
import { getWalletConnect } from "@/utils/wallet";
import {
  addToast,
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCallback, useMemo } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  toAddress: string;
  paymentLamports: number;
  onSuccess: (tx: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  toAddress,
  paymentLamports,
  onSuccess,
}: Props) {
  const { address, wallet } = useUserStore();
  const fromAddress = address;
  const amount = paymentLamports / LAMPORTS_PER_SOL;

  const toPay = useCallback(async () => {
    try {
      const walletConnect = getWalletConnect(wallet);
      const tx = await walletConnect.createTransaction(
        new PublicKey(toAddress),
        paymentLamports
      );
      const txSigned = await walletConnect.signTransaction(tx);
      console.log(txSigned);
    } catch (e: any) {
      console.error("Error paying", e);
      addToast({
        title: "Error paying",
        description: e.message,
        severity: "danger",
      });
    }
  }, [toAddress, paymentLamports, wallet]);

  const onMock = useCallback(() => {
    const tx =
      "277a14821100000018a314001723bf67277a1482110000000ea814001723bf67277a148211000000fe8601001723bf674f8cfc9e01000000102700001723bf674f8cfc9e01000000102700001723bf674f8cfc9e01000000a08601001723bf67277a148211000000f95ece001723bf67";
    onSuccess(tx);
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
        value: `${amount} SOL`,
      },
    ];
  }, [fromAddress, toAddress, amount]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      classNames={{
        backdrop: "z-10",
        wrapper: "z-10",
      }}
    >
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
              <Button onPress={toPay}>Payment</Button>
              <Button onPress={onMock}>Mock</Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
