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
  Spinner,
} from "@heroui/react";
import { connectToWallet, WalletId } from "@/utils/wallet/connect";
import { useUserStore } from "@/stores/user";
import { CHAIN } from "@/utils/chain";
import MetamaskLogo from "./icons/metamask-icon.svg";
import OKXLogo from "./icons/OKX_logo.svg";
import Image from "next/image";

const isSolChain = CHAIN === "SOL";

const SOL_WALLETS = [
  {
    id: WalletId.PHANTOM,
    title: "Phantom",
    icon: null,
  },
];

const BSC_WALLETS = [
  {
    id: WalletId.METAMASK,
    title: "MetaMask",
    icon: MetamaskLogo,
  },
];

const WALLETS = [
  ...(isSolChain ? SOL_WALLETS : BSC_WALLETS),
  {
    id: WalletId.OKX,
    title: "OKX",
    icon: OKXLogo,
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
  const [isConnectingWallet, setIsConnectingWallet] = useState<WalletId | null>(
    null
  );

  const connectWallet = useCallback(
    async (key: Key) => {
      setWalletError(undefined);
      const wallet = WALLETS.find((it) => it.id === key);
      if (!wallet) return;

      try {
        setIsConnectingWallet(wallet.id);
        await connectToWallet(wallet.id);
        setIsConnectingWallet(null);
        if (useUserStore.getState().isLogin) {
          onClose();
        }
      } catch (e: any) {
        setIsConnectingWallet(null);
        console.error("[LoginModal] connect error", e);
        setWalletError({
          walletId: wallet.id,
          errorMessage: e?.message || e?.toString() || "Failed to connect",
        });
      }
    },
    [onClose]
  );

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
                  disableRipple={isConnectingWallet === wallet.id}
                  isDisabled={isConnectingWallet === wallet.id}
                >
                  <CardBody className="p-5">
                    <div className="flex space-x-2 items-center">
                      {wallet?.icon && (
                        <Image
                          className="w-6 h-6"
                          src={wallet.icon}
                          alt={wallet.title}
                        />
                      )}
                      <span className="ml-2">{wallet.title}</span>
                      {isConnectingWallet === wallet.id && (
                        <Spinner size="sm" />
                      )}
                    </div>
                  </CardBody>
                  {walletError?.walletId === wallet.id && (
                    <CardFooter>
                      <Alert color="danger">{walletError.errorMessage}</Alert>
                    </CardFooter>
                  )}
                </Card>
              ))}
              <Alert color="default" className="text-sm" variant="flat">
                Please disable other EVM chain wallets before connecting.
              </Alert>
            </ModalBody>
            <ModalFooter />
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
