import { Controller, useForm } from "react-hook-form";
import { GenerateInviteCodeArg } from "@/utils/aitonomy";
import { useCallback, useEffect } from "react";
import { Button, Form, Input, NumberInput } from "@heroui/react";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import { generateInviteCodes, inviteUser } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import {
  GenerateInviteCodePayload,
  InviteUserPayload,
} from "@/utils/aitonomy/type";
import { WalletIcon } from "lucide-react";
import { sleep } from "@/utils/tools";

interface InviteUserFormProps {
  community: any;
  invitecodeAmount: number;
  setIsOpenPaymentModal: (isOpen: boolean) => void;
  paymentFee: string;
  txHash: string;
  setPaymentAmount: (amount: string) => void;
  refreshInvitecodeAmount: () => Promise<void>;
}

export default function BuyInviteCodeForm({
  community,
  invitecodeAmount,
  setIsOpenPaymentModal,
  paymentFee,
  txHash,
  setPaymentAmount,
  refreshInvitecodeAmount,
}: InviteUserFormProps) {
  const { control, setValue, watch, handleSubmit } = useForm<
    GenerateInviteCodeArg & { amount: number }
  >({
    defaultValues: {
      community: community?.name || "",
      tx: "",
      amount: 1,
    },
  });

  const amount = watch("amount");

  useEffect(() => {
    setPaymentAmount(`${amount * Number(paymentFee)}`);
  }, [amount, paymentFee, setPaymentAmount]);

  useEffect(() => {
    setValue("tx", txHash);
  }, [txHash, setValue]);

  const onSubmit = useCallback(
    async (data: any) => {
      const payload = {
        community: data.community,
        tx: ` ${data.tx}`,
      };
      console.log("payload", payload);
      const signature = await signPayload(payload, GenerateInviteCodePayload);
      console.log("signature", signature);

      const { success, message: errorMessage } = await generateInviteCodes(
        payload,
        signature
      );
      if (!success) {
        toast.error(`Failed: ${errorMessage}`);
        return;
      }
      await sleep(2000);
      await refreshInvitecodeAmount();
      toast.success("Successfully generated invite code");
    },
    [refreshInvitecodeAmount]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full pb-2">
        <p className="text-small">Invite code amount: {invitecodeAmount}</p>
      </div>
      <Controller
        name="amount"
        control={control}
        rules={{
          required: "Amount is required",
          validate: (value) => {
            if (!Number.isInteger(value)) {
              return "Invalid amount";
            }
            if (value < 1) {
              return `Amount cannot be less than 1`;
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
              {...field}
              label="Buy Number"
              labelPlacement="outside"
              placeholder="amount"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
          </div>
        )}
      />
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
            <Button onPress={() => setIsOpenPaymentModal(true)}>
              <WalletIcon className="w-6 h-6" />
              Send
            </Button>
          </div>
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
  );
}
