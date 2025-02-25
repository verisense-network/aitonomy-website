import { UserCircleIcon } from "@heroicons/react/24/outline";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { Key, useCallback, useState } from "react";
import LoginModal from "./modal/LoginModal";
import { useUserStore } from "@/store/user";

export default function UserMenu() {
  const [isOpenOption, setIsOpenOption] = useState<string | null>(null);
  const userStore = useUserStore();

  const openMenu = useCallback(
    (key: Key) => {
      setIsOpenOption(key as string);
      if (key === "logout") {
        userStore.logout();
      }
    },
    [userStore]
  );

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent">
            {userStore.isLogin ? (
              <Avatar name={userStore.name} />
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
          {userStore.isLogin ? (
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
