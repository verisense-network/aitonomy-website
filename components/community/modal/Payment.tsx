import { useUserStore } from "@/store/user";
import { getWalletConnect } from "@/utils/wallet";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useCallback } from "react";

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
    const walletConnect = getWalletConnect(wallet);
    const tx = await walletConnect.createTransaction(
      new PublicKey(toAddress),
      paymentLamports
    );
    const txSigned = await walletConnect.signTransaction(tx);
    console.log(txSigned);
  }, [toAddress, paymentLamports, wallet]);

  const onMock = useCallback(() => {
    const tx =
      "277a14821100000018a314001723bf67277a1482110000000ea814001723bf67277a148211000000fe8601001723bf674f8cfc9e01000000102700001723bf674f8cfc9e01000000102700001723bf674f8cfc9e01000000a08601001723bf67277a148211000000f95ece001723bf67";
    onSuccess(tx);
  }, [onSuccess]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Transaction</ModalHeader>
            <ModalBody>
              <div>From: {fromAddress}</div>
              <div>To: {toAddress}</div>
              <div>Amount: {amount} SOL</div>
              <Button onPress={toPay}>Payment</Button>
              <Button onPress={onMock}>Mock</Button>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
