"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { hexToLittleEndian } from "@/utils/tools";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import PaymentModal from "./modal/Payment";
import { activateCommunity, getBalances } from "@/app/actions";
import { useUserStore } from "@/store/user";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { isYouAddress } from "../thread/utils";
import { usePaymentCommunityStore } from "@/store/paymentCommunity";
import { CommunityStatus } from "./utils";

interface Props {
  communityId: string;
}

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const { data, isLoading, mutate } = useMeilisearch("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
    limit: 1,
  });
  const [isActivatingLoading, setIsActivatingLoading] = useState(false);
  const { isLogin, address } = useUserStore();
  const { setSignature: storePaymentSignature } = usePaymentCommunityStore();

  const [currentBalance, setCurrentBalance] = useState<number | null>(null);

  const community = data?.hits[0];
  const paymentLamports = community?.status?.WaitingTx;
  const paymentSol = paymentLamports / LAMPORTS_PER_SOL;

  const isCreateFailed =
    community && community?.status?.[CommunityStatus.CreateFailed];

  const shouldShowActivateCommunity =
    isLogin && isYouAddress(community?.creator);

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
  }, []);

  const checkCommunityActivateStatus = useCallback(
    async (txHash: string, retryCount: number = 0) => {
      if (!community) return;
      if (!(CommunityStatus.Active in community.status)) {
        setIsActivatingLoading(true);
        if (retryCount < 3) {
          if (!txHash) return;
          const payload = { community: community?.name, tx: txHash };
          console.log("payload", payload);
          await activateCommunity(payload);
          console.log(
            `Checking community activation status: attempt ${retryCount + 1}/4`
          );
          await new Promise((resolve) => setTimeout(resolve, 10000));
          await checkCommunityActivateStatus(txHash, retryCount + 1);
        } else {
          console.log(
            "Maximum retry attempts reached. Community still not active."
          );
          mutate(undefined, { revalidate: false });
        }
      } else {
        console.log("Community is now active!");
        setIsActivatingLoading(false);
        mutate(undefined, { revalidate: false });
      }
    },
    [community, mutate]
  );

  const onSuccess = useCallback(
    async (txHash: string) => {
      const payload = { community: community?.name, tx: txHash };
      storePaymentSignature({ community: community?.name, signature: txHash });
      console.log("onSuccess", payload);
      const res = await activateCommunity(payload);
      console.log("res", res);
      checkCommunityActivateStatus(txHash);
      setIsOpenPaymentModal(false);
    },
    [checkCommunityActivateStatus, community?.name, storePaymentSignature]
  );

  const getBalance = useCallback(async () => {
    const balances = await getBalances({
      accountId: address,
      gt: communityId,
      limit: 1,
    });
    const current = balances[0];
    console.log("current", current);
    if (!current) {
      // setCurrentBalance(0);
      return;
    }
    const communityInfo = current[0];
    const currentBalance = current[1];
    setCurrentBalance(currentBalance);
  }, [address, communityId]);

  const retryWithStoreSignature = useCallback(async () => {
    const signature = usePaymentCommunityStore.getState().signature;
    setIsActivatingLoading(true);
    if (!signature) {
      console.error("signature not found");
      return;
    }
    const res = await activateCommunity({
      community: community?.name,
      tx: signature,
    });
    setTimeout(() => {
      mutate(undefined, { revalidate: false });
      setIsActivatingLoading(false);
    }, 10000);
    console.log("res", res);
  }, [community?.name, mutate]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
    <>
      <Card className="m-6 p-4 min-h-40">
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-4 items-center">
              <Avatar name={community?.name} size="lg" />
              <h1 className="text-2xl font-bold">{community?.name}</h1>
              {shouldShowActivateCommunity && paymentSol > 0 && (
                <div className="flex">
                  <Chip
                    color="warning"
                    size="lg"
                    classNames={{
                      base: "h-9",
                      content: "flex space-x-2 items-center",
                    }}
                  >
                    <span>Waiting tx {paymentSol} SOL</span>
                    <Button
                      variant="shadow"
                      size="sm"
                      color="primary"
                      onPress={toPayment}
                    >
                      Payment
                    </Button>
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
                  <Button
                    variant="shadow"
                    size="sm"
                    color="primary"
                    onPress={retryWithStoreSignature}
                  >
                    Retry
                  </Button>
                </Chip>
              )}
              {isLoading && <Spinner />}
              {isActivatingLoading && <Spinner title="Activating..." />}
            </div>
            {currentBalance && (
              <div className="flex items-center space-x-2">
                <div>Balance: {currentBalance}</div>
                <Avatar
                  src={community?.token_info?.image}
                  name={community?.token_info?.symbol}
                />
              </div>
            )}
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
        paymentLamports={paymentLamports}
        onSuccess={onSuccess}
      />
    </>
  );
}
