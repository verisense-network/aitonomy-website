"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { hexToLittleEndian, sleep } from "@/utils/tools";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
} from "@heroui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import PaymentModal from "./modal/Payment";
import { activateCommunity, getBalances } from "@/app/actions";
import { useUserStore } from "@/stores/user";
import { isYouAddress } from "../thread/utils";
import { usePaymentCommunityStore } from "@/stores/paymentCommunity";
import { CommunityStatus } from "./utils";
import { getWalletConnect } from "@/utils/wallet";
import { Id, toast } from "react-toastify";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";

interface Props {
  communityId: string;
}

const MAX_RETRY = 15;

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [isActivatingLoading, setIsActivatingLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const { isLogin, address, wallet } = useUserStore();
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

  const amount = community?.status?.WaitingTx;
  const viewAmount = amount ? formatReadableAmount(amount) : "";

  const isCreateFailed =
    community && community?.status?.[CommunityStatus.CreateFailed];

  const hasStoredSignature =
    community?.name === storedCommunity && storedSignature;

  const shouldShowActivateCommunity =
    isLogin && isYouAddress(community?.creator);

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
  }, []);

  const communityRef = useRef(community);

  useEffect(() => {
    communityRef.current = community;
  }, [community]);

  const checkCommunityActivateStatus = useCallback(
    async (txHash: string, toastId: Id, retryCount: number = 0) => {
      const communityCurrent = communityRef.current;
      console.log("community", communityCurrent, communityCurrent?.status);
      if (!communityCurrent) return;
      if (communityCurrent.status !== CommunityStatus.Active) {
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
      } else {
        forceUpdate();
        setTimeout(() => {
          setIsActivatingLoading(false);
          console.log("Community is now active!");
          toast.update(toastId, {
            render: "Community is now active!",
            type: "success",
            isLoading: false,
            autoClose: 2000,
          });
        }, 2000);
      }
      forceUpdate();
    },
    [forceUpdate, wallet]
  );

  const onSuccess = useCallback(
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

  const getBalance = useCallback(async () => {
    try {
      const {
        success,
        data: balances,
        message: errorMessage,
      } = await getBalances({
        accountId: address,
        gt: communityId,
        limit: 1,
      });
      if (!success || !balances) {
        throw new Error(errorMessage);
      }
      const current = balances[0];
      if (!current) {
        // setCurrentBalance(0);
        return;
      }
      const communityInfo = current[0];
      const currentBalance = current[1];
      setCurrentBalance(currentBalance);
    } catch (e: any) {
      console.error("getBalance error", e);
      toast.error("Failed to get balance");
    }
  }, [address, communityId]);

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
    getBalance();
  }, [getBalance]);

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

  return (
    <>
      <Card className="m-2 p-4 min-h-40">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-4 items-center">
              <Avatar name={community?.name} src={community?.logo} size="lg" />
              <h1 className="text-2xl font-bold">{community?.name}</h1>
              {shouldShowActivateCommunity && Number(viewAmount) > 0 && (
                <div className="flex">
                  <Chip
                    color="warning"
                    size="lg"
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
              {shouldShowActivateCommunity && isCreateFailed && (
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
            <div className="flex items-center space-x-2">
              {currentBalance && <div>Balance: {currentBalance}</div>}
              <div className="flex flex-col items-center">
                <Avatar
                  src={community?.token_info?.image}
                  name={community?.token_info?.symbol}
                />
                <span className="text-md">{community?.token_info?.symbol}</span>
              </div>
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
        onSuccess={onSuccess}
      />
    </>
  );
}
