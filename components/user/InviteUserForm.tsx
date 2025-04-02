import { Controller, useForm } from "react-hook-form";
import { InviteUserArg } from "@/utils/aitonomy";
import { useCallback } from "react";
import { Button, Form, Input } from "@heroui/react";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";
import { toast } from "react-toastify";
import { checkPermission, inviteUser } from "@/app/actions";
import { signPayload } from "@/utils/aitonomy/sign";
import { InviteUserPayload } from "@verisense-network/vemodel-types";

interface InviteUserFormProps {
  community: any;
  setTab: (tab: "invite" | "buy") => void;
  invitecodeAmount: number;
  onSuccess: () => void;
}

export default function InviteUserForm({
  community,
  setTab,
  invitecodeAmount,
  onSuccess,
}: InviteUserFormProps) {
  const { control, handleSubmit } = useForm<InviteUserArg>({
    defaultValues: {
      invitee: "",
    },
  });

  const checkIsInvited = useCallback(
    async (address: string) => {
      if (!community.id) {
        toast.error("Failed: community is not found");
        return;
      }
      if (!address) {
        toast.error("address is empty");
        return;
      }
      const { data: isInvited, success } = await checkPermission({
        communityId: community.id,
        accountId: address,
      });
      if (!success) {
        toast.error("Failed: check is invited error");
        return;
      }
      if (isInvited) {
        toast.success("User is already invited");
        return;
      }
      toast.success("User is not invited");
    },
    [community.id]
  );

  const onSubmit = useCallback(
    async (data: any) => {
      if (!community.name) {
        toast.error("Failed: community name is not found");
        return;
      }
      if (invitecodeAmount < 1) {
        toast.error(
          "Failed: invite code amount is not enough, please buy more"
        );
        setTab("buy");
        return;
      }

      const payload = {
        community: community.name,
        invitee: data.invitee,
      };
      console.log("payload", payload);
      const signature = await signPayload(payload, InviteUserPayload);
      console.log("signature", signature);

      const { success, message: errorMessage } = await inviteUser(
        payload,
        signature
      );
      console.log("success", success);
      console.log("errorMessage", errorMessage);
      if (!success) {
        toast.error(`Failed: ${errorMessage}`);
        return;
      }
      onSuccess();
    },
    [community.name, invitecodeAmount, onSuccess, setTab]
  );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="invitee"
        control={control}
        rules={{
          required: "Please enter a address",
          validate: (value) => {
            if (!ethers.isAddress(value)) {
              return "Invalid address";
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
              label="User Address"
              labelPlacement="outside"
              placeholder="Enter a user address"
              isInvalid={!!fieldState.error}
              errorMessage={fieldState.error?.message}
            />
            <Button onPress={() => checkIsInvited(field.value)}>
              Check invited
            </Button>
          </div>
        )}
      />
      <div className="w-full">
        <p className="text-small">Invite code amount</p>
        <div className="flex space-x-2 w-full mt-2">
          <div className="px-3 py-2 w-2/3 bg-zinc-800 rounded-xl">
            {invitecodeAmount}
          </div>
          <Button
            onPress={() => {
              setTab("buy");
            }}
            className="w-1/3"
          >
            Buy More
          </Button>
        </div>
      </div>
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
