import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { Key, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useAccount } from "wagmi";
import Image from "next/image";
import { formatAddress } from "@/utils/tools";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";

export default function UserMenu() {
  const router = useRouter();
  const { user, disconnect, isLoading } = useUser();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();
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
        <Button>
          {isShowSpinner ? <Spinner /> : isLogin ? alias : "Connect"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label={`Dropdown menu`}
        variant="faded"
        onAction={openMenu}
      >
        {isLogin ? (
          <>
            <DropdownItem key="wallet">
              {connector && (
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2 items-center">
                    {connector.icon && (
                      <Image
                        src={connector.icon}
                        width={18}
                        height={18}
                        alt={connector.name}
                      />
                    )}
                    <span>{connector.name}</span>
                  </div>
                  <span>{formatAddress(address)}</span>
                </div>
              )}
            </DropdownItem>
            <DropdownItem key="profile">Profile</DropdownItem>
            <DropdownItem key="disconnect">Disconnect</DropdownItem>
          </>
        ) : null}
      </DropdownMenu>
    </Dropdown>
  );
}
