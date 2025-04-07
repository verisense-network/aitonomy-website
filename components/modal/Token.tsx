"use client";

import { abiBalanceOf } from "@/utils/abis";
import { formatAddress, getAddressLink } from "@/utils/tools";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Avatar,
  Tooltip,
  Listbox,
  ListboxItem,
  ListboxSection,
  Button,
  useDisclosure,
} from "@heroui/react";
import { ethers } from "ethers";
import Link from "next/link";
import { useReadContract } from "wagmi";
import TokenRecharge from "./TokenRecharge";
import { isYouAddress } from "../thread/utils";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
}

export default function TokenModal({
  isOpen,
  onClose,
  community,
}: TokenModalProps) {
  const {
    isOpen: isOpenTokenRechargeModal,
    onOpen: onOpenTokenRechargeModal,
    onClose: onCloseTokenRechargeModal,
  } = useDisclosure();
  const { data: balance } = useReadContract({
    abi: abiBalanceOf,
    address: community?.token_info?.contract,
    functionName: "balanceOf",
    args: [community?.agent_contract],
  });

  if (!community) return;

  const isAgentCreator = isYouAddress(community.creator);

  const listBoxData = [
    {
      label: "Token",
      items: [
        {
          label: "Token Contract",
          value: community.token_info?.contract,
          type: "address",
        },
        {
          label: "Total Issuance",
          value: community.token_info?.total_issuance
            ? Number(
                ethers.formatUnits(
                  community.token_info?.total_issuance,
                  community.token_info?.decimals
                )
              ).toLocaleString()
            : "0",
        },
        {
          label: "Decimals",
          value: community.token_info?.decimals,
        },
      ],
    },
    {
      label: "Agent",
      items: [
        {
          label: "Agent Contract",
          value: community.agent_contract,
          type: "address",
        },
        {
          label: "Agent Balance",
          value: `${
            balance
              ? Number(
                  ethers.formatUnits(
                    balance as number,
                    community.token_info?.decimals
                  )
                ).toLocaleString()
              : "0"
          } ${community?.token_info?.symbol}`,
        },
      ],
    },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg font-semibold">
                {community.name} Token
              </ModalHeader>
              <ModalBody>
                <div className="flex justify-between py-4">
                  <div className="flex flex-col justify-center items-center w-1/3">
                    <Avatar
                      src={community?.token_info?.image}
                      name={community?.token_info?.symbol}
                    />
                    <div className="flex items-center mt-1 space-x-1 text-md">
                      <span className="text-sm">
                        {community?.token_info?.symbol}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col text-sm text-zinc-300 w-2/3">
                    <Listbox>
                      {listBoxData.map((section, index) => (
                        <ListboxSection
                          key={section.label}
                          title={section.label}
                          showDivider={index !== listBoxData.length - 1}
                        >
                          {section.items.map((item) => (
                            <ListboxItem
                              key={item.label}
                              classNames={{
                                title: "text-md",
                              }}
                              endContent={
                                item?.type === "address" ? (
                                  <Tooltip content={item.value}>
                                    <Link
                                      href={getAddressLink(item.value)}
                                      target="_blank"
                                    >
                                      {formatAddress(item.value)}
                                    </Link>
                                  </Tooltip>
                                ) : (
                                  item.value
                                )
                              }
                            >
                              {item.label}
                            </ListboxItem>
                          ))}
                        </ListboxSection>
                      ))}
                    </Listbox>
                    {isAgentCreator && (
                      <Button
                        color="primary"
                        onPress={onOpenTokenRechargeModal}
                        className="mt-2"
                        size="sm"
                      >
                        Recharge Agent
                      </Button>
                    )}
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
      <TokenRecharge
        community={community}
        isOpen={isOpenTokenRechargeModal}
        onClose={onCloseTokenRechargeModal}
        onOpen={onOpenTokenRechargeModal}
      />
    </>
  );
}
