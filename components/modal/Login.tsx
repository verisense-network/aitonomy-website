import { Key, useCallback, useState } from "react";
import {
  Alert,
  Button,
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
import { connectToWallet } from "@/utils/wallet/connect";
import { WalletId } from "@/utils/wallet/id";
import { useUserStore } from "@/stores/user";
import { CHAIN } from "@/utils/chain";
import WalletIcon from "@/components/icons/WalletIcon";
import { useAppearanceStore } from "@/stores/appearance";
import Link from "next/link";

const isSolChain = CHAIN === "SOL";

const isMobile = useAppearanceStore.getState().isMobile;

const SOL_WALLETS = [
  {
    id: WalletId.PHANTOM,
    title: "Phantom",
    icon: null,
    downloadUrl: "https://phantom.com/download",
  },
];

const BSC_WALLETS = [
  {
    id: WalletId.METAMASK,
    title: "MetaMask",
    icon: "metamask",
    downloadUrl: "https://metamask.io/download",
  },
];

const WALLETS = [
  ...(isSolChain ? SOL_WALLETS : BSC_WALLETS),
  ...(isMobile
    ? [
        {
          id: WalletId.OKX_APP,
          title: "OKX App",
          icon: "okx",
          downloadUrl: "https://www.okx.com/download",
        },
      ]
    : [
        {
          id: WalletId.OKX,
          title: "OKX",
          icon: "okx",
          downloadUrl: "https://www.okx.com/download",
        },
      ]),
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
                        <WalletIcon
                          name={wallet.icon}
                          alt={wallet.title}
                          width={24}
                          height={24}
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
                      <Alert color="danger">
                        {walletError.errorMessage}{" "}
                        {walletError.errorMessage?.includes("not found") && (
                          <Link
                            className="text-sky-200"
                            href={wallet.downloadUrl}
                            target="_blank"
                          >
                            Download
                          </Link>
                        )}
                      </Alert>
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
