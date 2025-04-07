import {
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  NumberInput,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Id, toast } from "react-toastify";
import { formatAmount } from "@/utils/format";
import TransferTokenModal from "./TransferToken";

interface TokenRechargeProps {
  isOpen: boolean;
  community?: any;
  onClose: () => void;
  onOpen: () => void;
  onSuccess: () => void;
}

interface TokenRechargeForm {
  amount: number;
}

export default function TokenRecharge({
  isOpen,
  community,
  onClose,
  onSuccess,
}: TokenRechargeProps) {
  const [currentCommunity, setCurrentCommunity] = useState(community);
  const {
    isOpen: isOpenPaymentModal,
    onOpen: onOpenPaymentModal,
    onClose: onClosePaymentModal,
  } = useDisclosure();
  const [toAddress, setToAddress] = useState(currentCommunity?.agent_contract);
  const [paymentAmount, setPaymentAmount] = useState("0");

  const { control, watch, handleSubmit } = useForm<TokenRechargeForm>({
    defaultValues: {
      amount: 0,
    },
  });

  const inputAmount = watch("amount");

  useEffect(() => {
    setPaymentAmount(
      formatAmount(
        inputAmount,
        community?.token_info?.decimals || 18
      ).toString()
    );
  }, [inputAmount, community?.token_info?.decimals]);

  const onSubmit = useCallback(async () => {
    onOpenPaymentModal();
  }, [onOpenPaymentModal]);

  const onPaymentSuccess = useCallback(
    (success: boolean, toastId: Id) => {
      toast.update(toastId, {
        render: success
          ? "successful, transaction has been set"
          : "failed, transaction has not been set",
        type: success ? "success" : "error",
        isLoading: false,
        autoClose: 2000,
      });
      onClosePaymentModal();
      onClose();
      setTimeout(() => {
        onSuccess();
      }, 2000);
    },
    [onClosePaymentModal, onClose, onSuccess]
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
          <ModalHeader>Recharge Agent</ModalHeader>
          <ModalBody>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="amount"
                control={control}
                rules={{
                  required: "Amount is required",
                  validate: (value) => {
                    if (value <= 0) {
                      return "Amount must be greater than 0";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <NumberInput
                    label="Amount"
                    labelPlacement="outside"
                    placeholder="Enter recharge amount"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    value={Number(field.value)}
                    onValueChange={field.onChange}
                    minValue={0}
                    formatOptions={{
                      maximumFractionDigits:
                        community?.token_info?.decimals || 8,
                    }}
                    endContent={
                      <span className="text-gray-500">
                        {community?.token_info?.symbol}
                      </span>
                    }
                    description={`maximum fraction digits is ${
                      community?.token_info?.decimals || 8
                    }`}
                  />
                )}
              />
              <div className="flex gap-2">
                <Button color="primary" type="submit">
                  Submit
                </Button>
                <Button type="reset" variant="flat">
                  Reset
                </Button>
              </div>
            </Form>
          </ModalBody>
        </ModalContent>
      </Modal>
      <TransferTokenModal
        isOpen={isOpenPaymentModal}
        onClose={onClosePaymentModal}
        community={currentCommunity}
        toAddress={toAddress}
        amount={paymentAmount}
        onSuccess={onPaymentSuccess}
      />
    </>
  );
}
