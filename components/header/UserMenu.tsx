import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Spinner,
} from "@heroui/react";
import { Key, useCallback, useEffect, useState } from "react";
import LoginModal from "./modal/LoginModal";
import { useUserStore } from "@/stores/user";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { updateAccountInfo } from "@/utils/user";

export default function UserMenu() {
  const [isOpenOption, setIsOpenOption] = useState<string | null>(null);
  const { name, address, isLogin, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      await updateAccountInfo();
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to get user profile");
      setIsLoading(false);
    }
  }, [address]);

  const openMenu = useCallback(
    (key: Key) => {
      setIsOpenOption(key as string);
      if (key === "profile") {
        router.push("/u/" + address);
      }
      if (key === "logout") {
        logout();
      }
    },
    [address, logout, router]
  );

  useEffect(() => {
    if (!address) return;
    getUserProfile();
  }, [address, getUserProfile]);

  return (
    <>
      <Dropdown
        onOpenChange={() => {
          if (!isLogin) {
            openMenu("login");
          }
        }}
      >
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent">
            {isLogin ? (
              isLoading ? (
                <Spinner />
              ) : (
                <Avatar name={name} />
              )
            ) : (
              <UserCircleIcon
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`Dropdown menu`}
          variant="faded"
          onAction={openMenu}
        >
          {isLogin ? (
            <>
              <DropdownItem key="profile">Profile</DropdownItem>
              <DropdownItem key="logout">Logout</DropdownItem>
            </>
          ) : (
            <DropdownItem key="login">Login</DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>
      <LoginModal
        isOpen={isOpenOption === "login"}
        onClose={() => setIsOpenOption(null)}
      />
    </>
  );
}
