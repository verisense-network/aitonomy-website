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
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import PaymentModal from "./modal/Payment";
import { activateCommunity, getBalances } from "@/app/actions";
import { useUserStore } from "@/store/user";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

interface Props {
  communityId: string;
}

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const { data, isLoading } = useMeilisearch("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
    limit: 1,
  });
  const { isLogin, address } = useUserStore();

  const [currentBalance, setCurrentBalance] = useState<number | null>(null);

  const community = data?.hits[0];
  const paymentLamports = community?.status?.WaitingTx;
  const paymentSol = paymentLamports / LAMPORTS_PER_SOL;

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
    const id = hexToLittleEndian(communityId);
  }, [communityId]);

  const onSuccess = useCallback(
    async (tx: string) => {
      const payload = { community: community?.name, tx };
      // const signature = await signPayload(payload);
      const res = await activateCommunity(payload);
      console.log("res", res);
      setIsOpenPaymentModal(false);
    },
    [community]
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
              {isLogin && address === community?.creator && paymentSol > 0 && (
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
        <CardBody>{community?.description}</CardBody>
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
