import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  User,
  Spinner,
} from "@heroui/react";
import { Key, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAccount, useSwitchChain } from "wagmi";
import { formatAddress } from "@/utils/tools";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAppearanceStore } from "@/stores/appearance";
import { bsc } from "@/config/bscChain";
import { toast } from "react-toastify";

export default function UserMenu() {
  const router = useRouter();
  const { user, disconnect, isLoading } = useUser();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { isMobile } = useAppearanceStore();
  const { connector, isConnecting, isReconnecting, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { alias, isLogin, address } = user;

  const isShowSpinner = isLoading || isConnecting || isReconnecting;

  const checkNetwork = useCallback(() => {
    if (!connector || (chainId && Number.isNaN(chainId))) return;
    if (chainId !== bsc.id) {
      toast.info("request switch to BSC network");
      switchChain?.({ chainId: bsc.id });
    }
  }, [chainId, switchChain, connector]);

  const openMenu = useCallback(
    (key: Key) => {
      if ("connect" === key) {
        openConnectModal?.();
        checkNetwork();
      } else if ("wallet" === key) {
        openAccountModal?.();
      } else if (key === "profile") {
        router.push("/u/" + address);
      } else if (key === "disconnect") {
        disconnect();
      }
    },
    [
      address,
      router,
      disconnect,
      openConnectModal,
      openAccountModal,
      checkNetwork,
    ]
  );

  useEffect(() => {
    checkNetwork();
  }, [checkNetwork]);

  return (
    <Dropdown
      onOpenChange={() => {
        if (!isLogin) {
          openMenu("connect");
        }
      }}
    >
      <DropdownTrigger>
        <Button
          color={!isLogin ? "primary" : "default"}
          startContent={
            isShowSpinner ? <Spinner size="sm" color="secondary" /> : null
          }
          variant={isLogin ? "faded" : "shadow"}
          size={isMobile ? "sm" : "md"}
        >
          {isLogin ? alias : "Connect"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Dropdown menu`}
        variant="faded"
        onAction={openMenu}
      >
        {isLogin ? (
          <>
            {connector && (
              <DropdownItem key="wallet">
                <User
                  avatarProps={{
                    size: "sm",
                    radius: "lg",
                    src: connector.icon || connector.name,
                  }}
                  classNames={{
                    name: "text-default-600",
                    description: "text-default-500",
                  }}
                  description={
                    <div className="flex text-xs space-x-2">
                      <p>{connector.name}</p>
                      <p>{formatAddress(address)}</p>
                    </div>
                  }
                  name={alias}
                />
              </DropdownItem>
            )}
            <DropdownItem key="profile">Profile</DropdownItem>
            <DropdownItem key="disconnect">Disconnect</DropdownItem>
          </>
        ) : (
          <DropdownItem key="disconnect">Disconnect</DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
