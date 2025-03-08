"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import {
  ArrowLeftCircleIcon,
  Bars3Icon,
  HomeIcon,
  PlusIcon,
  UserGroupIcon,
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

export default function SideMenu() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const [createCommunityModal, setCreateCommunityModal] = useState(false);

  const { data, isLoading } = useMeilisearch("community", undefined, {
    sort: ["created_time:desc"],
    limit: 5,
  });

  console.log(data);

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

  return (
    <div
      className={twMerge(
        isOpen ? "w-[240px]" : "w-12",
        "relative border-r-1 border-zinc-800"
      )}
    >
      <Button
        onPress={() => setIsOpen(!isOpen)}
        isIconOnly
        variant="light"
        className="absolute top-12 -right-4 shadow-0 text-zinc-300"
      >
        {isOpen ? (
          <ArrowLeftCircleIcon className="w-8 h-8 bg-black" />
        ) : (
          <Bars3Icon className="w-8 h-8 bg-black" />
        )}
      </Button>
      <div className={twMerge(isOpen ? "" : "hidden", "", "p-2 pr-4")}>
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
              onPress={() => setCreateCommunityModal(true)}
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
                >
                  {community.name}
                </ListboxItem>
              )) || []}
            </Listbox>
          </AccordionItem>
        </Accordion>
        <Divider />
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
  );
}
