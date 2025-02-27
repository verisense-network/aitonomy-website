"use client";

import useMeilisearch from "@/hooks/useMeilisearch";
import { hexToLittleEndian, LAMPORTS_PER_SOL } from "@/utils/tools";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
} from "@heroui/react";
import { hasWaitingTx } from "./utils";
import { useCallback, useState } from "react";
import PaymentModal from "./modal/Payment";
import { activateCommunity } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";

interface Props {
  communityId: string;
}

export default function CommunityBrand({ communityId }: Props) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const { data, isLoading } = useMeilisearch("community", undefined, {
    filter: `id = ${hexToLittleEndian(communityId)}`,
    limit: 1,
  });

  const community = data?.hits[0];
  const paymentLamports = community?.status?.WaitingTx;
  const paymentSol = paymentLamports / LAMPORTS_PER_SOL;

  const toPayment = useCallback(() => {
    setIsOpenPaymentModal(true);
    const id = hexToLittleEndian(communityId);

    console.log("paymentLamports", paymentLamports);
  }, [communityId, paymentLamports]);

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

  return (
    <>
      <Card className="m-6 p-4 min-h-40">
        <CardHeader>
          <div className="flex space-x-4 items-center">
            <Avatar name={community?.name} size="lg" />
            <h1 className="text-2xl font-bold">{community?.name}</h1>
            {paymentSol > 0 && (
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
