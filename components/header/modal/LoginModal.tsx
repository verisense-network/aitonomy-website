import { Key, useCallback, useState } from "react";
import {
  Alert,
  Card,
  CardBody,
  CardFooter,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { connectToWallet, WalletId } from "@/utils/wallet/connect";
import { useUserStore } from "@/store/user";

const WALLETS = [
  {
    id: WalletId.OKX,
    title: "OKX",
    icon: null,
  },
  {
    id: WalletId.METAMASK,
    title: "Metamask",
    icon: null,
  },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: Props) {
  const [walletError, setWalletError] = useState<{
    walletId: WalletId;
    errorMessage: string;
  }>();

  const connectWallet = useCallback(async (key: Key) => {
    setWalletError(undefined);
    const wallet = WALLETS.find((it) => it.id === key);
    if (!wallet) return;
    console.log("wallet", wallet);

    try {
      await connectToWallet(wallet.id);
      if (useUserStore.getState().isLogin) {
        onClose();
      }
    } catch (e: any) {
      console.error("[LoginModal] connect error", e);
      setWalletError({
        walletId: wallet.id,
        errorMessage: e?.message || e?.toString() || "Failed to connect",
      });
    }
  }, [onClose]);

  return (
    <Modal isOpen={!!isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Login</ModalHeader>
            <ModalBody>
              {WALLETS.map((wallet) => (
                <Card
                  key={wallet.id}
                  isPressable
                  onPress={() => connectWallet(wallet.id)}
                >
                  <CardBody>{wallet.title}</CardBody>
                  {walletError?.walletId === wallet.id && (
                    <CardFooter>
                      <Alert color="danger">{walletError.errorMessage}</Alert>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </ModalBody>
            <ModalFooter />
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
