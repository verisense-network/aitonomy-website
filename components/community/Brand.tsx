"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { hexToLittleEndian, sleep } from "@/utils/tools";
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
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import PaymentModal from "../modal/Payment";
import { activateCommunity, getCommunity } from "@/app/actions";
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
  UserPlusIcon,
} from "lucide-react";
import TokenPanel from "./token/TokenPanel";
import { CommunityMode } from "@verisense-network/vemodel-types";

interface Props {
  communityId: string;
}

const MAX_RETRY = 15;

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [isActivatingLoading, setIsActivatingLoading] = useState(false);
  const [isOpenInviteModal, setIsOpenInviteModal] = useState(false);
  const { isLogin } = useUserStore();
  const { isYouAddress } = useUser();
  const { isMobile } = useAppearanceStore();
  const {
    setSignature: storePaymentSignature,
    community: storedCommunity,
    signature: storedSignature,
  } = usePaymentCommunityStore();

  const { data, isLoading, forceUpdate, isValidating } = useMeilisearch(
    "community",
    undefined,
    {
      filter: `id = ${hexToLittleEndian(communityId)}`,
      limit: 1,
    }
  );

  const community = data?.hits[0];
  const communityRef = useRef(community);
  const c = communityRef.current || community;

  const amount = c?.status?.WaitingTx;
  const viewAmount = amount ? formatReadableAmount(amount) : "";

  const isLoaded = !isLoading && c;
  const communityMode = c?.mode;
  console.log("communityMode", communityMode);

  const isCommunityMode = useCallback(
    (mode: keyof CommunityMode) => {
      const cRef = communityRef.current || community;
      return cRef && (cRef?.mode?.[mode] || cRef?.mode === mode);
    },
    [community]
  );

  const isPublicCommunity = isCommunityMode("Public");

  const isCommunityStatus = useCallback(
    (status: CommunityStatus) => {
      const cRef = communityRef.current || community;
      return cRef && (cRef?.status?.[status] || cRef?.status === status);
    },
    [community]
  );

  const hasStoredSignature = c?.name === storedCommunity && storedSignature;

  const shouldShowActivateCommunity = isLogin && isYouAddress(c?.creator);

  const shouldShowInviteUser =
    shouldShowActivateCommunity && !isPublicCommunity;

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
  }, []);

  useEffect(() => {
    communityRef.current = community;
  }, [community]);

  const checkCommunityActivateStatus = useCallback(
    async (txHash: string, toastId: Id, retryCount: number = 0) => {
      if (!c) return;
      if (
        isCommunityStatus(CommunityStatus.WaitingTx) ||
        isCommunityStatus(CommunityStatus.TokenIssued)
      ) {
        setIsActivatingLoading(true);
        if (retryCount < MAX_RETRY) {
          if (!txHash) return;
          const payload = { community: c.name, tx: txHash };

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
          forceUpdate();
          await sleep(2000);
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
        forceUpdate();
        setTimeout(() => {
          setIsActivatingLoading(false);
          console.log("Token is issued!");
          toast.update(toastId, {
            render: "Token is now issued, community is activating...",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
          forceUpdate();
        }, 2000);
      }
      forceUpdate();
    },
    [c, forceUpdate, isCommunityStatus]
  );

  const onActivateSuccess = useCallback(
    async (txHash: string, toastId: Id) => {
      console.log("onSuccess", txHash);
      const payload = { community: c?.name, signature: txHash };
      storePaymentSignature({ community: c?.name, signature: txHash });
      console.log("storePaymentSignature", payload);
      toast.update(toastId, {
        render: "Checking community activation status...",
        type: "info",
        isLoading: true,
      });
      await checkCommunityActivateStatus(txHash, toastId, 0);
      setIsOpenPaymentModal(false);
    },
    [checkCommunityActivateStatus, c?.name, storePaymentSignature]
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
      community: c?.name,
      tx: signature,
    });
    if (!success) {
      toast.error(errorMessage);
      return;
    }
    const toastId = toast.loading("checking activation status");
    checkCommunityActivateStatus(signature, toastId, 0);
    console.log("res", res);
  }, [checkCommunityActivateStatus, c?.name]);

  useEffect(() => {
    (async () => {
      const res = await getCommunity(communityId);
      console.log("res", res);
    })();
  }, [communityId]);

  useEffect(() => {
    (async () => {
      if (isLoading || isValidating) return;

      if (!data?.hits?.length) {
        console.log("not found force update");
        await sleep(1500);
        forceUpdate();
        return;
      }
      const hasCommunity = data?.hits?.some(
        (hit: any) => hit.id === hexToLittleEndian(communityId)
      );
      if (!hasCommunity) {
        console.log("not has");
        await sleep(1500);
        console.log("not has force update");
        forceUpdate();
      }
    })();
  }, [communityId, data, forceUpdate, isLoading, isValidating]);

  const onInviteSuccess = useCallback(() => {
    setIsOpenInviteModal(false);
    toast.success("Invite successful");
  }, []);

  return (
    <>
      <Card className="m-2 p-2 md:p-4 min-h-40">
        <CardHeader>
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center w-full space-y-2">
            <div className="flex flex-wrap space-x-4 items-center">
              <Badge
                color="default"
                isOneChar
                content={
                  <Tooltip content={getCommunityMode(c?.mode)}>
                    {getCommunityModeIcon(c?.mode)}
                  </Tooltip>
                }
                showOutline={false}
                placement="bottom-right"
              >
                <Avatar name={c?.name} src={c?.logo} size="lg" />
              </Badge>
              <div className="flex flex-col">
                <div className="flex flex-wrap space-x-4 items-center">
                  <h1 className="flex items-center text-2xl font-bold">
                    {c?.name}
                    {isLoaded &&
                      (isCommunityStatus(CommunityStatus.Active) ? (
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
                      ))}
                    {isLoaded &&
                      shouldShowInviteUser &&
                      isCommunityStatus(CommunityStatus.Active) && (
                        <Tooltip content="Invite User">
                          <UserPlusIcon
                            className="ml-2 w-6 h-6 text-sky-200"
                            onClick={() => setIsOpenInviteModal(true)}
                          />
                        </Tooltip>
                      )}
                  </h1>
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
                        {!isLoading && (
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
                        )}
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
                        {!isLoading && hasStoredSignature && (
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
                  {isLoading && <Spinner />}
                  {isActivatingLoading && <Spinner title="Activating..." />}
                </div>
                <div>
                  <p className="text-sm text-zinc-400">{c?.slug}</p>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              {isCommunityStatus(CommunityStatus.Active) && (
                <TokenPanel community={c} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading && <Spinner />}
          {c?.description}
          <div className="flex md:hidden items-center space-x-2 w-full justify-center mt-4">
            {isCommunityStatus(CommunityStatus.Active) && (
              <TokenPanel community={c} />
            )}
          </div>
        </CardBody>
      </Card>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() => setIsOpenPaymentModal(false)}
        toAddress={c?.agent_pubkey}
        amount={amount}
        onSuccess={onActivateSuccess}
      />
      {isOpenInviteModal && (
        <InviteUser
          isOpen={isOpenInviteModal}
          community={c}
          onClose={() => setIsOpenInviteModal(false)}
          onSuccess={() => onInviteSuccess()}
        />
      )}
    </>
  );
}
