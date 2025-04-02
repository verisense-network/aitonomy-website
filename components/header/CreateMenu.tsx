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
import { Key, Suspense, useCallback } from "react";
import CommunityCreate from "../community/Create";
import ThreadCreate from "../thread/Create";
import { useUserStore } from "@/stores/user";
import { toast } from "react-toastify";
import { CirclePlusIcon, PenIcon, PlusIcon } from "lucide-react";
import { useModalStore } from "@/stores/modal";

const menuList = [
  {
    name: "community",
    title: "New community",
    icon: <PlusIcon className="w-5 h-5" />,
  },
  {
    name: "thread",
    title: "Post thread",
    icon: <PenIcon className="w-5 h-5" />,
  },
];

export default function CreateMenu() {
  const {
    isShowCreateCommunity,
    setIsShowCreateCommunity,
    isShowCreateThread,
    setIsShowCreateThread,
  } = useModalStore();
  const { isLogin } = useUserStore();

  const openMenu = useCallback(
    (key: Key) => {
      if (!isLogin) {
        toast.info("Please login first");
        return;
      }

      const item = menuList.find((it) => it.name === key);
      if (!item) return;

      if (item.name === "community") {
        setIsShowCreateCommunity(true);
      } else if (item.name === "thread") {
        setIsShowCreateThread(true);
      }
    },
    [isLogin, setIsShowCreateCommunity, setIsShowCreateThread]
  );

  return (
    <>
      <Dropdown>
        <DropdownTrigger>
          <Button className="create-community-step1" isIconOnly variant="light">
            <CirclePlusIcon className="w-6 h-6 md:w-8 md:h-8" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={`Dropdown menu`}
          variant="faded"
          onAction={openMenu}
        >
          {menuList.map((item) => (
            <DropdownItem key={item.name} startContent={item.icon}>
              {item.title}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      <Modal
        isOpen={isShowCreateCommunity || isShowCreateThread}
        onClose={() => {
          setIsShowCreateCommunity(false);
          setIsShowCreateThread(false);
        }}
        isDismissable={false}
        size="xl"
        classNames={{
          body: "max-h-[90vh] overflow-y-auto md:max-h-[95vh]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {isShowCreateCommunity ? "Create community" : "Post thread"}
              </ModalHeader>
              <ModalBody>
                <Suspense>
                  {isShowCreateCommunity && (
                    <CommunityCreate onClose={onClose} />
                  )}
                  {isShowCreateThread && <ThreadCreate onClose={onClose} />}
                </Suspense>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
