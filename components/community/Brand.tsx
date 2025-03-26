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
import { activateCommunity } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { isYouAddress } from "../thread/utils";
import { usePaymentCommunityStore } from "@/stores/paymentCommunity";
import { CommunityStatus } from "./utils";
import { getWalletConnect } from "@/utils/wallet";
import { Id, toast } from "react-toastify";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";
import { useAppearanceStore } from "@/stores/appearance";
import {
  CheckBadgeIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import InviteUser from "../user/InviteUser";

interface Props {
  communityId: string;
}

const MAX_RETRY = 15;

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [isActivatingLoading, setIsActivatingLoading] = useState(false);
  const [isOpenInviteModal, setIsOpenInviteModal] = useState(false);
  const { isLogin, wallet } = useUserStore();
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

  const amount = community?.status?.WaitingTx;
  const viewAmount = amount ? formatReadableAmount(amount) : "";

  const isLoaded = !isLoading && communityRef.current;
  const isPrivateCommunity = community?.private;

  const isCommunityStatus = useCallback(
    (status: CommunityStatus) => {
      const c = communityRef.current || community;
      return c && (c?.status?.[status] || c?.status === status);
    },
    [community]
  );

  const hasStoredSignature =
    community?.name === storedCommunity && storedSignature;

  const shouldShowActivateCommunity =
    isLogin && isYouAddress(community?.creator);

  const shouldShowInviteUser =
    shouldShowActivateCommunity && isPrivateCommunity;

  console.log("shouldShowInviteUser", shouldShowInviteUser);

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
  }, []);

  useEffect(() => {
    communityRef.current = community;
  }, [community]);

  const checkCommunityActivateStatus = useCallback(
    async (txHash: string, toastId: Id, retryCount: number = 0) => {
      const communityCurrent = communityRef.current;
      if (!communityCurrent) return;
      if (isCommunityStatus(CommunityStatus.WaitingTx)) {
        setIsActivatingLoading(true);
        const userWallet = getWalletConnect(wallet);
        if (retryCount < MAX_RETRY) {
          if (!txHash) return;
          const payload = { community: communityCurrent?.name, tx: txHash };
          console.log("payload", payload);
          const tx = await userWallet.getFinalizedTransaction(txHash);

          console.log("tx", tx);

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
      } else if (isCommunityStatus(CommunityStatus.TokenIssued)) {
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
    [forceUpdate, isCommunityStatus, wallet]
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
          <div className="flex justify-between items-center w-full">
            <div className="flex flex-wrap space-x-4 items-center">
              <Badge
                color="default"
                isOneChar
                content={<LockClosedIcon className="w-3 h-3" />}
                showOutline={false}
                isInvisible={!isPrivateCommunity}
                placement="bottom-right"
              >
                <Avatar
                  name={community?.name}
                  src={community?.logo}
                  size="lg"
                />
              </Badge>
              <div className="flex flex-col">
                <div className="flex flex-wrap space-x-4 items-center">
                  <h1 className="flex items-center text-2xl font-bold">
                    {community?.name}
                    {isLoaded &&
                      (isCommunityStatus(CommunityStatus.Active) ? (
                        <Tooltip content="Activated">
                          <CheckBadgeIcon className="ml-2 w-6 h-6 text-success" />
                        </Tooltip>
                      ) : isCommunityStatus(CommunityStatus.TokenIssued) ? (
                        <Tooltip content="Token Issued">
                          <CurrencyDollarIcon className="ml-2 w-6 h-6 text-warning" />
                        </Tooltip>
                      ) : (
                        <Tooltip content="Inactive">
                          <ExclamationCircleIcon className="ml-2 w-6 h-6 text-danger" />
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
                        {!isLoading &&
                          (hasStoredSignature ? (
                            <Button
                              variant="shadow"
                              size="sm"
                              color="primary"
                              onPress={retryWithStoreSignature}
                            >
                              Retry
                            </Button>
                          ) : (
                            <Button
                              variant="shadow"
                              size="sm"
                              color="primary"
                              onPress={toPayment}
                            >
                              Payment
                            </Button>
                          ))}
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
                  <p className="text-sm text-zinc-400">{community?.slug}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isCommunityStatus(CommunityStatus.Active) && (
                <div className="flex flex-col items-center">
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
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading && <Spinner />}
          {community?.description}
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
          defaultCommunity={community?.name}
          agentPubkey={community?.agent_pubkey}
          onClose={() => setIsOpenInviteModal(false)}
          onSuccess={() => onInviteSuccess()}
        />
      )}
    </>
  );
}
