"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import {
  CircleDollarSignIcon,
  CircleHelpIcon,
  HeartHandshakeIcon,
  HomeIcon,
  PanelLeftOpenIcon,
  PanelRightOpenIcon,
  PlusIcon,
  TelescopeIcon,
} from "lucide-react";
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
  Tooltip,
  User,
} from "@heroui/react";
import { Suspense, useState } from "react";
import { twMerge } from "tailwind-merge";
import { useCallback } from "react";
import { hexToLittleEndian } from "@/utils/tools";
import CommunityCreate from "../community/Create";
import { useAppearanceStore } from "@/stores/appearance";
import { useUserStore } from "@/stores/user";
import { toast } from "react-toastify";
import Link from "next/link";

const TopMenus = [
  { name: "Home", href: "/", icon: <HomeIcon className="w-5 h-5" /> },
  {
    name: "Explore",
    href: "/explore",
    icon: <TelescopeIcon className="w-5 h-5" />,
  },
];

const SidebarMenus = [
  {
    name: "Incentive Plan",
    href: "/legals/incentive-plan",
    icon: <HeartHandshakeIcon className="w-5 h-5" />,
  },
  {
    name: "Fee",
    href: "/legals/fee",
    icon: <CircleDollarSignIcon className="w-5 h-5" />,
  },
];

const FooterLegals = [
  {
    name: "Privacy Policy",
    href: "/legals/privacy-policy",
  },
  {
    name: "Terms of Service",
    href: "/legals/terms-of-service",
  },
];

export default function SideMenu() {
  const { sideBarIsOpen, setSideBarIsOpen, setWelcomeModalIsOpen } =
    useAppearanceStore();
  const { isLogin } = useUserStore();
  const { isMobile } = useAppearanceStore();
  const [createCommunityModal, setCreateCommunityModal] = useState(false);

  const { data, isLoading } = useMeilisearch("community", undefined, {
    // filter: "status = 'Active'",
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

  return (
    <>
      <div
        className={twMerge(
          sideBarIsOpen ? "md:w-[240px]" : "w-1 md:w-12",
          "group fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-black border-r border-zinc-800 transition-colors duration-200"
        )}
      >
        <Button
          onPress={() => setSideBarIsOpen(!sideBarIsOpen)}
          isIconOnly
          variant="light"
          className="absolute top-20 -right-5 shadow-0 text-zinc-300 hover:text-white group-hover:border-zinc-700"
        >
          {sideBarIsOpen ? (
            <PanelRightOpenIcon className="w-8 h-8 bg-black" />
          ) : (
            <PanelLeftOpenIcon className="w-8 h-8 bg-black" />
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
          >
            {TopMenus.map((it) => (
              <ListboxItem
                as={Link}
                key={it.name}
                href={it.href}
                startContent={it.icon}
                onPress={() => isMobile && setSideBarIsOpen(false)}
              >
                {it.name}
              </ListboxItem>
            ))}
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
              >
                {data?.hits?.map((community) => (
                  <ListboxItem
                    as={Link}
                    key={community.id}
                    href={`/c/${hexToLittleEndian(community.id)}`}
                    startContent={
                      <User
                        avatarProps={{
                          src: community.logo,
                          name: community.name,
                        }}
                        name={
                          <Tooltip content={community.name}>
                            <span className="block text-nowrap overflow-hidden text-ellipsis text-truncate w-32">
                              {community.name}
                            </span>
                          </Tooltip>
                        }
                      />
                    }
                    onPress={() => isMobile && setSideBarIsOpen(false)}
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
          >
            <ListboxItem
              key="how-to-works"
              startContent={<CircleHelpIcon className="w-5 h-5" />}
              onPress={() => setWelcomeModalIsOpen(true)}
            >
              How it works
            </ListboxItem>
            {
              SidebarMenus.map((it) => (
                <ListboxItem
                  as={Link}
                  key={it.name}
                  startContent={it.icon}
                  onPress={() => isMobile && setSideBarIsOpen(false)}
                  href={it.href}
                >
                  {it.name}
                </ListboxItem>
              )) as any
            }
          </Listbox>
          <div className="flex flex-col space-y-2 px-3 text-zinc-400">
            <div className="flex text-xs space-x-2">
              {FooterLegals.map((it) => (
                <Link
                  className="hover:text-zinc-300"
                  key={it.name}
                  href={it.href}
                >
                  {it.name}
                </Link>
              ))}
            </div>
            <div>
              <span className="text-xs">AItonomy.world 2025</span>
            </div>
            <div className="flex space-x-2 items-center">
              <p className="text-xs">
                Powered by{" "}
                <Link
                  className="text-primary"
                  href="https://verisense.network/"
                  target="_blank"
                >
                  Verisense
                </Link>
              </p>
              <Link href="https://x.com/veri_sense" target="_blank">
                <SiX className="w-3 h-3" />
              </Link>
              <Link href="https://github.com/verisense-network" target="_blank">
                <SiGithub className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
        <Modal
          isOpen={createCommunityModal}
          onClose={() => setCreateCommunityModal(false)}
          isDismissable={false}
          size="xl"
          classNames={{
            body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
          }}
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
      <div
        className={twMerge(sideBarIsOpen ? "md:w-[240px]" : "w-1 md:w-12")}
      />
      {isMobile && sideBarIsOpen && (
        <div
          className="fixed top-16 left-0 w-svw h-[calc(100vh-4rem)] bg-black/50 z-30"
          onClick={() => setSideBarIsOpen(false)}
        />
      )}
    </>
  );
}
