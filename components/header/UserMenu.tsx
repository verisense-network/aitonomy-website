import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Avatar,
  addToast,
  Spinner,
} from "@heroui/react";
import { Key, useCallback, useEffect, useState } from "react";
import LoginModal from "./modal/LoginModal";
import { useUserStore } from "@/store/user";
import UserProfile from "../user/modal/Profile";
import { getAccountInfo } from "@/app/actions";

export default function UserMenu() {
  const [isOpenOption, setIsOpenOption] = useState<string | null>(null);
  const { name, address, isLogin, setUserName, logout } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const getUserProfile = useCallback(async () => {
    try {
      if (!address) return;
      setIsLoading(true);
      const account = await getAccountInfo({
        accountId: address,
      });
      const aliasName = account?.alias || name || address?.slice(0, 4);
      setUserName(aliasName);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      addToast({
        title: "Error",
        description: "Failed to get user profile",
      });
      setIsLoading(false);
    }
  }, [address, name, setUserName]);

  const openMenu = useCallback(
    (key: Key) => {
      setIsOpenOption(key as string);
      if (key === "logout") {
        logout();
      }
    },
    [logout]
  );

  useEffect(() => {
    if (!address) return;
    getUserProfile();
  }, [address, getUserProfile]);

  return (
    <>
      <Dropdown>
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
      <UserProfile
        isOpen={isOpenOption === "profile"}
        onClose={() => setIsOpenOption(null)}
      />
    </>
  );
}
