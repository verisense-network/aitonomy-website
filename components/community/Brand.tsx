"use client";

import { useMeilisearch } from "@/hooks/useMeilisearch";
import { sleep } from "@/utils/tools";
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import PaymentModal from "../modal/Payment";
import { activateCommunity } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { usePaymentCommunityStore } from "@/stores/paymentCommunity";
import {
  CommunityStatus,
  getCommunityMode,
  getCommunityModeIcon,
} from "./utils";
import { waitForTransactionReceipt } from "@wagmi/core";
import { Id, toast } from "react-toastify";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";
import { useAppearanceStore } from "@/stores/appearance";
import InviteUser from "../user/InviteUser";
import { wagmiConfig } from "@/config/wagmi";
import { useUser } from "@/hooks/useUser";
import {
  BadgeCheckIcon,
  CircleAlertIcon,
  CircleDollarSignIcon,
  CogIcon,
  UserPlusIcon,
} from "lucide-react";
import TokenPanel from "./token/TokenPanel";
import { Community, CommunityMode } from "@verisense-network/vemodel-types";
import useCanPost from "@/hooks/useCanPost";
import JoinCommunity from "../user/JoinCommunity";
import CommunitySettings from "./Settings";

interface Props {
  community: Community;
}

const MAX_RETRY = 15;

export default function CommunityBrand({ community }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [isActivatingLoading, setIsActivatingLoading] = useState(false);
  const [isOpenInviteModal, setIsOpenInviteModal] = useState(false);
  const [isOpenJoinCommunityModal, setIsOpenJoinCommunityModal] =
    useState(false);
  const communitySettingsDisclosure = useDisclosure();
  const { isLogin } = useUserStore();
  const { isYouAddress } = useUser();
  const { isMobile } = useAppearanceStore();
  const {
    setSignature: storePaymentSignature,
    community: storedCommunity,
    signature: storedSignature,
  } = usePaymentCommunityStore();

  const canPost = useCanPost(community);

  const amount = `${community?.status?.WaitingTx}`;
  const viewAmount = amount ? formatReadableAmount(amount) : "";

  const isCommunityMode = useCallback(
    (mode: keyof CommunityMode) => {
      return (
        community &&
        (community?.mode?.[mode] || (community as any)?.mode === mode)
      );
    },
    [community]
  );

  const isCommunityStatus = useCallback(
    (status: CommunityStatus) => {
      return (
        community &&
        (community?.status?.[status] || (community as any)?.status === status)
      );
    },
    [community]
  );

  const hasStoredSignature =
    community?.name === storedCommunity && storedSignature;

  const isCreator = isLogin && isYouAddress(community?.creator);
  const shouldShowActivateCommunity = isLogin && isCreator;

  const shouldShowInviteUser =
    shouldShowActivateCommunity && isCommunityMode("InviteOnly");

  const shouldShowJoinCommunity =
    isLogin && !canPost && !isCommunityMode("Public");

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
  }, []);

  const checkCommunityActivateStatus = useCallback(
    async (txHash: string, toastId: Id, retryCount: number = 0) => {
      if (!community) return;
      if (
        isCommunityStatus(CommunityStatus.WaitingTx) ||
        isCommunityStatus(CommunityStatus.TokenIssued)
      ) {
        setIsActivatingLoading(true);
        if (retryCount < MAX_RETRY) {
          if (!txHash) return;
          const payload = { community: community.name, tx: txHash };

          const tx = await waitForTransactionReceipt(wagmiConfig, {
            hash: txHash as `0x${string}`,
          });

          const renderCount = `${retryCount + 1}/${MAX_RETRY}`;
          if (!tx || (tx as any)?.meta?.err) {
            await sleep(3000);
            toast.update(toastId, {
              render: `Checking transaction status...${renderCount}`,
            });
            await checkCommunityActivateStatus(txHash, toastId, retryCount + 1);
            return;
          }

          const { success, message: errorMessage } = await activateCommunity(
            payload
          );
          if (!success) {
            toast.update(toastId, {
              render: `Failed to activate community: ${errorMessage}`,
              type: "error",
              isLoading: false,
              autoClose: 2000,
            });
            return;
          }
          console.log(
            `Checking community activation status: attempt ${renderCount}`
          );
          toast.update(toastId, {
            render: `Checking community activation status...${renderCount}`,
          });
          await sleep(5000);
          await checkCommunityActivateStatus(txHash, toastId, retryCount + 1);
        } else {
          console.log(
            "Maximum retry attempts reached. Community still not active."
          );
          setIsActivatingLoading(false);
          toast.update(toastId, {
            render:
              "Maximum retry attempts reached. Community still not active.",
            type: "error",
            isLoading: false,
            autoClose: 2000,
          });
        }
      } else if (isCommunityStatus(CommunityStatus.Active)) {
        setTimeout(() => {
          setIsActivatingLoading(false);
          console.log("Token is issued!");
          toast.update(toastId, {
            render: "Token is now issued, community is activating...",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
        }, 2000);
      }
    },
    [community, isCommunityStatus]
  );

  const onActivateSuccess = useCallback(
    async (txHash: string, toastId: Id) => {
      console.log("onSuccess", txHash);
      const payload = { community: community?.name, signature: txHash };
      storePaymentSignature({ community: community?.name, signature: txHash });
      console.log("storePaymentSignature", payload);
      toast.update(toastId, {
        render: "Checking community activation status...",
        type: "info",
        isLoading: true,
      });
      await checkCommunityActivateStatus(txHash, toastId, 0);
      setIsOpenPaymentModal(false);
    },
    [checkCommunityActivateStatus, community?.name, storePaymentSignature]
  );

  const retryWithStoreSignature = useCallback(async () => {
    const signature = usePaymentCommunityStore.getState().signature;
    setIsActivatingLoading(true);
    if (!signature) {
      console.error("signature not found");
      return;
    }
    const {
      success,
      data: res,
      message: errorMessage,
    } = await activateCommunity({
      community: community?.name,
      tx: signature,
    });
    if (!success) {
      toast.error(errorMessage);
      return;
    }
    const toastId = toast.loading("checking activation status");
    checkCommunityActivateStatus(signature, toastId, 0);
    console.log("res", res);
  }, [checkCommunityActivateStatus, community?.name]);

  const onInviteSuccess = useCallback(() => {
    setIsOpenInviteModal(false);
    toast.success("Invite successful");
  }, []);

  const openJoinCommunity = useCallback(() => {
    setIsOpenJoinCommunityModal(true);
  }, []);

  const onJoinCommunitySuccess = useCallback(() => {
    setIsOpenJoinCommunityModal(false);
    toast.success("Join community successful");
  }, []);

  const onCommunitySettingsSuccess = useCallback(
    (toastId: Id) => {
      communitySettingsDisclosure.onClose();
      toast.update(toastId, {
        render: "Community settings successful",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
    },
    [communitySettingsDisclosure]
  );

  const ControlPanel = (
    <>
      {isCommunityStatus(CommunityStatus.Active) ? (
        <Tooltip content="Activated">
          <BadgeCheckIcon className="ml-2 w-6 h-6 text-success" />
        </Tooltip>
      ) : isCommunityStatus(CommunityStatus.TokenIssued) ? (
        <Tooltip content="Token Issued">
          <CircleDollarSignIcon className="ml-2 w-6 h-6 text-warning" />
        </Tooltip>
      ) : (
        <Tooltip content="Inactive">
          <CircleAlertIcon className="ml-2 w-6 h-6 text-danger" />
        </Tooltip>
      )}
      {shouldShowInviteUser && isCommunityStatus(CommunityStatus.Active) && (
        <Tooltip content="Invite User">
          <UserPlusIcon
            className="ml-2 w-6 h-6 text-sky-200"
            onClick={() => setIsOpenInviteModal(true)}
          />
        </Tooltip>
      )}
      {shouldShowJoinCommunity && isCommunityStatus(CommunityStatus.Active) && (
        <Button
          className="ml-2"
          size="sm"
          color="primary"
          onPress={openJoinCommunity}
        >
          Join Community
        </Button>
      )}
      {isCreator && isCommunityStatus(CommunityStatus.Active) && (
        <Tooltip content="Settings">
          <CogIcon
            className="ml-2 w-6 h-6 text-zinc-300"
            onClick={() => communitySettingsDisclosure.onOpen()}
          />
        </Tooltip>
      )}
    </>
  );

  return (
    <>
      <Card className="m-2 p-2 md:p-4 min-h-40">
        <CardHeader>
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full space-y-2">
            <div className="flex flex-wrap gap-4 items-center">
              <Badge
                color="default"
                isOneChar
                content={
                  <Tooltip content={getCommunityMode(community?.mode)}>
                    {getCommunityModeIcon(community?.mode)}
                  </Tooltip>
                }
                showOutline={false}
                placement="bottom-right"
              >
                <Avatar
                  name={community?.name}
                  src={community?.logo}
                  size="lg"
                />
              </Badge>
              <div className="flex flex-wrap items-center gap-1 md:flex-col md:items-start">
                <div className="flex flex-wrap space-x-4 items-center">
                  <div className="flex flex-wrap items-center text-2xl font-bold">
                    <h1>{community?.name}</h1>
                    <div className="hidden md:flex">{ControlPanel}</div>
                  </div>
                  {shouldShowActivateCommunity && Number(viewAmount) > 0 && (
                    <div className="flex">
                      <Chip
                        color="warning"
                        size={isMobile ? "sm" : "lg"}
                        classNames={{
                          base: "h-9",
                          content: "flex space-x-2 items-center",
                        }}
                      >
                        <span>
                          Waiting tx {viewAmount} {VIEW_UNIT}
                        </span>
                        {
                          <>
                            {hasStoredSignature && (
                              <Button
                                variant="shadow"
                                size="sm"
                                color="primary"
                                onPress={retryWithStoreSignature}
                              >
                                Retry
                              </Button>
                            )}
                            <Button
                              variant="shadow"
                              size="sm"
                              color="primary"
                              onPress={toPayment}
                            >
                              Payment
                            </Button>
                          </>
                        }
                      </Chip>
                    </div>
                  )}
                  {shouldShowActivateCommunity &&
                    isCommunityStatus(CommunityStatus.CreateFailed) && (
                      <Chip
                        color="danger"
                        size="lg"
                        classNames={{
                          base: "h-9",
                          content: "flex space-x-2 items-center",
                        }}
                      >
                        <span>Create Failed</span>
                        {hasStoredSignature && (
                          <Button
                            variant="shadow"
                            size="sm"
                            color="primary"
                            onPress={retryWithStoreSignature}
                          >
                            Retry
                          </Button>
                        )}
                      </Chip>
                    )}
                  {isActivatingLoading && <Spinner title="Activating..." />}
                </div>
                <div className="flex md:hidden">{ControlPanel}</div>
                <div className="hidden md:block">
                  <p className="text-sm text-zinc-400">{community?.slug}</p>
                </div>
              </div>
              <div className="md:hidden">
                <p className="text-sm text-zinc-400">{community?.slug}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {isCommunityStatus(CommunityStatus.Active) && (
                <TokenPanel community={community as Community} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {community?.description}
          <div className="flex md:hidden items-center space-x-2 w-full justify-center mt-4">
            {isCommunityStatus(CommunityStatus.Active) && (
              <TokenPanel community={community as Community} />
            )}
          </div>
        </CardBody>
      </Card>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() => setIsOpenPaymentModal(false)}
        toAddress={community?.agent_pubkey}
        amount={amount}
        onSuccess={onActivateSuccess}
      />
      {isOpenInviteModal && (
        <InviteUser
          isOpen={isOpenInviteModal}
          community={community}
          onClose={() => setIsOpenInviteModal(false)}
          onSuccess={() => onInviteSuccess()}
        />
      )}
      {isOpenJoinCommunityModal && (
        <JoinCommunity
          isOpen={isOpenJoinCommunityModal}
          community={community}
          onClose={() => setIsOpenJoinCommunityModal(false)}
          onSuccess={() => onJoinCommunitySuccess()}
        />
      )}
      {communitySettingsDisclosure.isOpen && (
        <CommunitySettings
          isOpen={communitySettingsDisclosure.isOpen}
          community={community}
          onClose={communitySettingsDisclosure.onClose}
          onSuccess={onCommunitySettingsSuccess}
          onOpenChange={communitySettingsDisclosure.onOpenChange}
        />
      )}
    </>
  );
}
