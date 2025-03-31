import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  User,
} from "@heroui/react";
import { Key, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAccount } from "wagmi";
import { formatAddress } from "@/utils/tools";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useAppearanceStore } from "@/stores/appearance";

export default function UserMenu() {
  const router = useRouter();
  const { user, disconnect, isLoading } = useUser();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
  const { isMobile } = useAppearanceStore();
  const { connector, isConnecting, isReconnecting } = useAccount();
  const { alias, isLogin, address } = user;

  const isShowSpinner = isLoading || isConnecting || isReconnecting;

  const openMenu = useCallback(
    (key: Key) => {
      if ("connect" === key) {
        openConnectModal?.();
      } else if ("wallet" === key) {
        openAccountModal?.();
      } else if (key === "profile") {
        router.push("/u/" + address);
      } else if (key === "disconnect") {
        disconnect();
      }
    },
    [address, router, disconnect, openConnectModal, openAccountModal]
  );

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
          isLoading={isShowSpinner}
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
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
