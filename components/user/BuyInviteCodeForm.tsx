import { Controller, useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import { Button, Form, Input, NumberInput } from "@heroui/react";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import {
  GenerateInviteTicketParams,
  generateInviteTickets,
} from "@/app/actions";
import { WalletIcon } from "lucide-react";
import { sleep } from "@/utils/tools";
import { formatReadableAmount, VIEW_UNIT } from "@/utils/format";

interface InviteUserFormProps {
  community: any;
  inviteTickets: number;
  setIsOpenPaymentModal: (isOpen: boolean) => void;
  txHash: string;
  inviteFee: number;
  paymentAmount: string;
  setPaymentAmount: (amount: string) => void;
  refreshInvitecodeAmount: () => Promise<void>;
}

export default function BuyInviteCodeForm({
  community,
  inviteTickets,
  setIsOpenPaymentModal,
  txHash,
  inviteFee,
  paymentAmount,
  setPaymentAmount,
  refreshInvitecodeAmount,
}: InviteUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { control, setValue, watch, handleSubmit } = useForm<
    GenerateInviteTicketParams & { amount: number }
  >({
    defaultValues: {
      communityId: community?.id || "",
      tx: "",
      amount: 1,
    },
  });

  const amount = watch("amount");

  useEffect(() => {
    if (
      !amount ||
      Number.isNaN(Number(amount)) ||
      Number.isNaN(Number(inviteFee))
    ) {
      return;
    }
    setPaymentAmount(`${BigInt(amount) * BigInt(inviteFee)}`);
  }, [amount, community, inviteFee, setPaymentAmount]);

  useEffect(() => {
    setValue("tx", txHash);
  }, [txHash, setValue]);

  const onSubmit = useCallback(
    async (data: any) => {
      try {
        setIsLoading(true);
        const payload = {
          communityId: data.communityId,
          tx: ` ${data.tx}`,
        };
        console.log("payload", payload);

        const { success, message: errorMessage } = await generateInviteTickets(
          payload
        );
        if (!success) {
          toast.error(`Failed: ${errorMessage}`);
          setIsLoading(false);
          return;
        }
        await sleep(2000);
        await refreshInvitecodeAmount();
        toast.success("Successfully generated invite code");
        setIsLoading(false);
      } catch (error) {
        toast.error("Failed to generate invite code");
        setIsLoading(false);
      }
    },
    [refreshInvitecodeAmount]
  );

  const openPaymentModal = useCallback(() => {
    if (!amount || Number.isNaN(Number(amount))) {
      handleSubmit(onSubmit)();
      toast.error("Invalid amount");
      return;
    }

    setIsOpenPaymentModal(true);
  }, [amount, setIsOpenPaymentModal, handleSubmit, onSubmit]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full">
        <p className="text-small">Ticket Balance</p>
        <div className="flex space-x-2 w-full mt-2">
          <div className="px-3 py-2 w-full bg-zinc-800 rounded-xl">
            {inviteTickets}
          </div>
        </div>
      </div>
      <div className="flex space-x-2 w-full">
        <div className="w-full">
          <p className="text-small">Ticket Price</p>
          <div className="flex space-x-2 w-full mt-2">
            <div className="px-3 py-2 w-full bg-zinc-800 rounded-xl">
              {`${formatReadableAmount(paymentAmount)} ${VIEW_UNIT}`}
            </div>
          </div>
        </div>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: "Amount is required",
            validate: (value) => {
              if (!Number.isInteger(Number(value))) {
                return "Invalid amount";
              }
              if (Number(value) < 1) {
                return `Amount cannot be less than 1`;
              }
              if (Number(value) > 1000000) {
                return `Amount cannot be greater than 1000000`;
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
              <NumberInput
                label="Number"
                labelPlacement="outside"
                placeholder="amount"
                isInvalid={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                value={field.value}
                defaultValue={field.value}
                onValueChange={field.onChange}
                maxValue={1000000}
                minValue={1}
                formatOptions={{
                  maximumFractionDigits: 0,
                }}
                isRequired
              />
            </div>
          )}
        />
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
            <Button onPress={openPaymentModal}>
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
  );
}
