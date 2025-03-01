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
import bs58 from "bs58";

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
      const sig = await walletConnect.signTransaction(tx);
      const signatureHex = bs58.encode(sig);
      console.log(sig);
      onSuccess(signatureHex);
    } catch (e: any) {
      console.error("Error paying", e);
      addToast({
        title: "Error paying",
        description: e.message,
        severity: "danger",
      });
    }
  }, [wallet, toAddress, paymentLamports, onSuccess]);

  const onMock = useCallback(() => {
    const tx =
      "3mhtBtxYVhRCHEvj4qkFyVMjXf8UWTFcJmHhmSp1hA6URvvJ3wrE1x13aKBGSZeF6ZwVH9AnpVje21vuPVhmP3t9";
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
