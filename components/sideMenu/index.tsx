"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import {
  ArrowLeftCircleIcon,
  Bars3Icon,
  CurrencyDollarIcon,
  HomeIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import {
  Accordion,
  AccordionItem,
  Button,
  Divider,
  Listbox,
  ListboxItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  User,
} from "@heroui/react";
import { Key, Suspense, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { hexToLittleEndian } from "@/utils/tools";
import CommunityCreate from "../community/Create";
import { useAppearanceStore } from "@/store/appearance";
import { useUserStore } from "@/store/user";
import { toast } from "react-toastify";

export default function SideMenu() {
  const { sideBarIsOpen, setSideBarIsOpen, setWelcomeModalIsOpen } =
    useAppearanceStore();
  const { isLogin } = useUserStore();
  const router = useRouter();
  const [createCommunityModal, setCreateCommunityModal] = useState(false);

  const { data, isLoading } = useMeilisearch("community", undefined, {
    // filter: "status = 'Active'", TODO: enable filterable status
    sort: ["created_time:desc"],
    limit: 5,
  });

  const showCreateCommunityModal = useCallback(() => {
    if (!isLogin) {
      toast.info("Please login first");
      return;
    }
    setCreateCommunityModal(true);
  }, [isLogin, setCreateCommunityModal]);

  const toCommunityPage = useCallback(
    (id: Key) => {
      const communityId = hexToLittleEndian(id as string);
      router.push("/c/" + communityId);
    },
    [router]
  );

  const onMenu1Actions = useCallback(
    (key: Key) => {
      if (key === "home") {
        router.push("/");
      } else if (key === "explore") {
        router.push("/explore");
      }
    },
    [router]
  );

  const onMenu2Actions = useCallback(
    (key: Key) => {
      if (key === "how-to-works") {
        setWelcomeModalIsOpen(true);
      } else {
        router.push(`/legals/${key as string}`);
      }
    },
    [router, setWelcomeModalIsOpen]
  );

  return (
    <>
      <div
        className={twMerge(
          sideBarIsOpen ? "w-[240px]" : "w-1 md:w-12",
          "fixed top-16 left-0 h-[calc(100vh-4rem)] z-20 bg-black border-r-1 border-zinc-800"
        )}
      >
        <Button
          onPress={() => setSideBarIsOpen(!sideBarIsOpen)}
          isIconOnly
          variant="light"
          className="absolute top-12 -right-4 shadow-0 text-zinc-300"
        >
          {sideBarIsOpen ? (
            <ArrowLeftCircleIcon className="w-8 h-8 bg-black" />
          ) : (
            <Bars3Icon className="w-8 h-8 bg-black" />
          )}
        </Button>
        <div className={twMerge(sideBarIsOpen ? "" : "hidden", "", "p-2 pr-4")}>
          <Listbox
            classNames={{
              list: "py-2",
            }}
            itemClasses={{
              base: "py-3",
            }}
            onAction={onMenu1Actions}
          >
            <ListboxItem
              key="home"
              startContent={<HomeIcon className="w-5 h-5" />}
            >
              Home
            </ListboxItem>
            <ListboxItem
              key="explore"
              startContent={<UserGroupIcon className="w-5 h-5" />}
            >
              Explore
            </ListboxItem>
          </Listbox>
          <Accordion defaultSelectedKeys={["communities"]}>
            <AccordionItem
              key="communities"
              aria-label="Communities"
              title="Communities"
            >
              <Button
                onPress={showCreateCommunityModal}
                variant="light"
                className="py-2 w-full"
              >
                <PlusIcon className="w-5 h-5" />
                Create Community
              </Button>
              <Listbox
                classNames={{
                  list: "py-2",
                }}
                emptyContent={
                  <div className="py-2">
                    {isLoading ? <Spinner /> : "No communities"}
                  </div>
                }
                onAction={toCommunityPage}
              >
                {data?.hits?.map((community) => (
                  <ListboxItem
                    key={community.id}
                    startContent={
                      <User
                        avatarProps={{
                          src: community.logo,
                          name: community.name,
                        }}
                        name={community.name}
                      />
                    }
                  ></ListboxItem>
                )) || []}
              </Listbox>
            </AccordionItem>
          </Accordion>
          <Divider />
          <Listbox
            classNames={{
              list: "py-2",
            }}
            itemClasses={{
              base: "py-3",
            }}
            onAction={onMenu2Actions}
          >
            <ListboxItem
              key="how-to-works"
              startContent={<QuestionMarkCircleIcon className="w-5 h-5" />}
            >
              How it works
            </ListboxItem>
            <ListboxItem
              key="privacy-policy"
              startContent={<ShieldCheckIcon className="w-5 h-5" />}
            >
              Privacy Policy
            </ListboxItem>
            <ListboxItem
              key="terms-of-service"
              startContent={<UsersIcon className="w-5 h-5" />}
            >
              Terms of Service
            </ListboxItem>
            <ListboxItem
              key="fees"
              startContent={<CurrencyDollarIcon className="w-5 h-5" />}
            >
              Fees
            </ListboxItem>
          </Listbox>
        </div>
        <Modal
          isOpen={createCommunityModal}
          onClose={() => setCreateCommunityModal(false)}
          isDismissable={false}
          size="xl"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Create community</ModalHeader>
                <ModalBody>
                  <Suspense>
                    <CommunityCreate onClose={onClose} />
                  </Suspense>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
      {/* Fixed Sidebar Placeholder */}
      <div className={twMerge(sideBarIsOpen ? "w-[240px]" : "w-1 md:w-12")} />
    </>
  );
}
