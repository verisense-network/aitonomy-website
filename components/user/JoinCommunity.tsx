import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useState } from "react";
import { isCommunityMode } from "../community/utils";
import { Controller, useForm } from "react-hook-form";
import { PaysFeeArg } from "@/utils/aitonomy";
import Link from "next/link";
import { formatAddress, getAddressLink } from "@/utils/tools";
import PaymentModal from "../modal/Payment";
import { Id, toast } from "react-toastify";
import { payToJoin } from "@/app/actions";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";
import { WalletIcon } from "lucide-react";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";

interface JoinCommunityProps {
  isOpen: boolean;
  community?: any;
  onSuccess: () => void;
  onClose: () => void;
}
export default function JoinCommunity({
  isOpen,
  community,
  onSuccess,
  onClose,
}: JoinCommunityProps) {
  const [currentCommunity, setCurrentCommunity] = useState(community);
  const {
    isOpen: isOpenPaymentModal,
    onOpen: onOpenPaymentModal,
    onClose: onClosePaymentModal,
  } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [toAddress, setToAddress] = useState(currentCommunity?.agent_pubkey);

  const [paymentAmount, setPaymentAmount] = useState(
    isCommunityMode(currentCommunity?.mode, "PayToJoin")
      ? currentCommunity?.mode?.PayToJoin
      : 0
  );

  const { control, setValue, handleSubmit } = useForm<PaysFeeArg>({
    defaultValues: {
      community: community?.name || "",
      tx: "",
    },
  });

  const onSubmit = useCallback(
    async (data: PaysFeeArg) => {
      try {
        setIsLoading(true);
        const payload: PaysFeeArg = {
          community: data.community,
          tx: ` ${data.tx}`,
        };
        console.log("payload", payload);

        const { success, message: errorMessage } = await payToJoin(payload);
        if (!success) {
          toast.error(`Failed: ${errorMessage}`);
          setIsLoading(false);
          return;
        }
        toast.success("Successfully joined");
        setIsLoading(false);
        onSuccess();
      } catch (error) {
        toast.error("Failed to join");
        setIsLoading(false);
      }
    },
    [onSuccess]
  );

  const onPaymentSuccess = useCallback(
    (tx: string, toastId: Id) => {
      setValue("tx", tx);
      toast.update(toastId, {
        render: "successful, transaction has been set",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });
      onClosePaymentModal();
    },
    [onClosePaymentModal, setValue]
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        classNames={{
          body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
        }}
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader>Join Community</ModalHeader>
          <ModalBody>
            {!isCommunityMode(currentCommunity?.mode, "InviteOnly") && (
              <>
                <div>
                  <p className="text-small">Community Creator Address</p>
                  <div className="flex space-x-2 w-full">
                    <div className="px-3 py-2 mt-2 text-sm bg-zinc-800 rounded-xl">
                      <Tooltip content={community.creator}>
                        <Link
                          href={getAddressLink(currentCommunity.creator)}
                          target="_blank"
                        >
                          {formatAddress(currentCommunity.creator)}
                        </Link>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </>
            )}
            {isCommunityMode(currentCommunity?.mode, "InviteOnly") && (
              <>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <div className="w-full">
                    <p className="text-small">Agent Address</p>
                    <div className="flex space-x-2 w-full mt-2">
                      <div className="px-3 py-2 text-sm w-full bg-zinc-800 rounded-xl">
                        {toAddress}
                      </div>
                    </div>
                  </div>
                  <div className="w-full">
                    <p className="text-small">Price</p>
                    <div className="flex space-x-2 w-full mt-2">
                      <div className="px-3 py-2 text-sm w-full bg-zinc-800 rounded-xl">
                        {`${formatReadableAmount(paymentAmount)} ${VIEW_UNIT}`}
                      </div>
                    </div>
                  </div>
                  <Controller
                    name="tx"
                    control={control}
                    rules={{
                      required: "Transaction hash is required",
                      validate: (value) => {
                        if (!ethers.isHexString(value)) {
                          return "Invalid tx hash";
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState }) => (
                      <div
                        className={twMerge(
                          "flex space-x-2 w-full",
                          !!fieldState.error ? "items-center" : "items-end"
                        )}
                      >
                        <Input
                          {...field}
                          className="w-3/4"
                          label="Transaction"
                          labelPlacement="outside"
                          placeholder="Enter your tx or to payment"
                          isInvalid={!!fieldState.error}
                          errorMessage={fieldState.error?.message}
                        />
                        <Button onPress={onOpenPaymentModal}>
                          <WalletIcon className="w-6 h-6" />
                          Payment
                        </Button>
                      </div>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button color="primary" type="submit" isLoading={isLoading}>
                      Submit
                    </Button>
                    <Button type="reset" variant="flat">
                      Reset
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={onClosePaymentModal}
        toAddress={toAddress}
        amount={paymentAmount}
        onSuccess={onPaymentSuccess}
      />
    </>
  );
}
