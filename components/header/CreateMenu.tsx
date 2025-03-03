import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Dropdown,
  DropdownTrigger,
  Button,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Key, Suspense, useCallback, useState } from "react";
import CommunityCreate from "../community/Create";
import ThreadCreate from "../thread/Create";
import { useUserStore } from "@/store/user";
import { toast } from "react-toastify";

const menuList = [
  {
    name: "community",
    title: "New community",
  },
  {
    name: "thread",
    title: "Post thread",
  },
];

export default function CreateMenu() {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const { isLogin } = useUserStore();

  const openMenu = useCallback(
    (key: Key) => {
      if (!isLogin) {
        toast.info("You need to login first");
        return;
      }

      const item = menuList.find((it) => it.name === key);
      if (!item) return;

      setIsOpen(item.name);
    },
    [isLogin]
  );

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button isIconOnly className="bg-transparent">
            <PlusCircleIcon
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`Dropdown menu`}
          variant="faded"
          onAction={openMenu}
        >
          {menuList.map((item) => (
            <DropdownItem key={item.name}>{item.title}</DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Modal isOpen={!!isOpen} onClose={() => setIsOpen(null)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create</ModalHeader>
              <ModalBody>
                <Suspense>
                  {isOpen === "community" && (
                    <CommunityCreate onClose={onClose} />
                  )}
                  {isOpen === "thread" && <ThreadCreate onClose={onClose} />}
                </Suspense>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
