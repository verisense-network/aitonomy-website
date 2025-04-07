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
import { useUserStore } from "@/stores/user";
import { useEffect } from "react";
import { formatReadableAmount } from "@/utils/format";
import { toast } from "react-toastify";

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
  const { isLogin, address: userAddress } = useUserStore();
  const {
    isOpen: isOpenTokenRechargeModal,
    onOpen: onOpenTokenRechargeModal,
    onClose: onCloseTokenRechargeModal,
  } = useDisclosure();
  const { data: agentBalance, refetch: refetchAgentBalance } = useReadContract({
    abi: abiBalanceOf,
    address: community?.token_info?.contract,
    functionName: "balanceOf",
    args: [community?.agent_contract],
  });
  const { data: userBalance, refetch: refetchUserBalance } = useReadContract({
    abi: abiBalanceOf,
    address: community?.token_info?.contract,
    functionName: "balanceOf",
    args: [userAddress as `0x${string}`],
  });

  useEffect(() => {
    if (isOpen) {
      refetchAgentBalance();
      refetchUserBalance();
    }
  }, [isOpen, refetchAgentBalance, refetchUserBalance]);

  const agentBalanceValue = agentBalance
    ? formatReadableAmount(
        (agentBalance as unknown as bigint).toString(),
        community?.token_info?.decimals
      )
    : "";

  useEffect(() => {
    if (!agentBalanceValue) return;
    if (!isLogin || !isYouAddress(community.creator)) return;

    if (Number(agentBalanceValue) < 50) {
      toast.warning("Agent balance is less than 50, please recharge");
    }
  }, [agentBalanceValue, isLogin, community.creator]);

  if (!community) return;

  const isAgentCreator = isYouAddress(community.creator);

  const listBoxData = [
    {
      label: "Token",
      items: [
        {
          label: "Token Contract",
          value: community.token_info?.contract,
          type: "token",
        },
        {
          label: "Total Issuance",
          value: community.token_info?.total_issuance
            ? Number(
                formatReadableAmount(
                  community.token_info?.total_issuance?.toString(),
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
          label: "Agent Address",
          value: community.agent_pubkey,
          type: "address",
        },
        {
          label: "Agent Creator",
          value: community.creator,
          type: "address",
        },
        {
          label: "Agent Balance",
          value: `${
            agentBalance
              ? Number(
                  formatReadableAmount(
                    agentBalance.toString(),
                    community.token_info?.decimals
                  )
                ).toLocaleString()
              : "0"
          } ${community?.token_info?.symbol}`,
        },
      ],
    },
    {
      label: "User",
      items: [
        {
          label: "My Address",
          value: userAddress,
          type: "address",
        },
        {
          label: "My Balance",
          value: `${
            userBalance
              ? Number(
                  formatReadableAmount(
                    userBalance.toString(),
                    community.token_info?.decimals
                  )
                ).toLocaleString()
              : "0"
          } ${community?.token_info?.symbol}`,
        },
      ],
    },
  ];

  const handleRefresh = () => {
    refetchAgentBalance();
    refetchUserBalance();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        classNames={{
          body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
        }}
        size="xl"
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
                                item?.type &&
                                ["address", "token"].includes(item?.type) ? (
                                  <Tooltip content={item.value}>
                                    <Link
                                      href={getAddressLink(
                                        item.value,
                                        item?.type as "address" | "token"
                                      )}
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
        onSuccess={handleRefresh}
      />
    </>
  );
}
