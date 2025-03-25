import { getInviteFee, inviteUser } from "@/app/actions";
import useMeilisearch from "@/hooks/useMeilisearch";
import { InviteUserArg } from "@/utils/aitonomy";
import { signPayload } from "@/utils/aitonomy/sign";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { InviteUserPayload } from "@/utils/aitonomy/type";
import { debounce } from "@/utils/tools";
import { CurrencyDollarIcon, WalletIcon } from "@heroicons/react/24/outline";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Form,
  Autocomplete,
  AutocompleteItem,
  Button,
  ModalFooter,
  Input,
} from "@heroui/react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Id, toast } from "react-toastify";
import PaymentModal from "../modal/Payment";
import { ethers } from "ethers";
import { twMerge } from "tailwind-merge";

interface InviteUserProps {
  isOpen: boolean;
  agentPubkey?: string;
  defaultCommunity?: string;
  onSuccess: () => void;
  onClose: () => void;
}
export default function InviteUser({
  isOpen,
  agentPubkey,
  defaultCommunity,
  onSuccess,
  onClose,
}: InviteUserProps) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [toAddress, setToAddress] = useState(agentPubkey || "");
  const [paymentAmount, setPaymentAmount] = useState("");
  const { control, setValue, watch, handleSubmit, reset } =
    useForm<InviteUserArg>({
      defaultValues: {
        community: defaultCommunity || "",
        tx: "",
        invitee: "",
      },
    });

  const [searchCommunity, setSearchCommunity] = useState("");

  const { data: communitiesData, isLoading } = useMeilisearch(
    "community",
    searchCommunity,
    {
      limit: 10,
    }
  );
  const currentCommunity = watch("community");

  useEffect(() => {
    if (!currentCommunity && defaultCommunity) {
      setValue("community", defaultCommunity);
    }
  }, [currentCommunity, defaultCommunity, setValue]);

  useEffect(() => {
    if (!toAddress && agentPubkey) {
      setToAddress(agentPubkey);
    }
  }, [agentPubkey, toAddress]);

  useEffect(() => {
    (async () => {
      if (!paymentAmount && toAddress) {
        const { data: fee, success } = await getInviteFee();
        if (!success || !fee) {
          throw new Error("Failed: get fee error");
        }
        console.log("fee", fee);
        setPaymentAmount(fee.toString());
      }
    })();
  }, [paymentAmount, toAddress]);

  const communities = communitiesData?.hits ?? [];

  const onSubmit = useCallback(
    async (data: any) => {
      const payload = {
        ...data,
        tx: ` ${data.tx}`,
      };
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
    [onSuccess]
  );

  const onPaymentSuccess = useCallback(
    (tx: string, toastId: Id) => {
      setIsOpenPaymentModal(false);
      console.log("data", tx);
      setValue("tx", tx);
      toast.update(toastId, {
        render: "successful, hash has been set",
        type: "success",
        isLoading: false,
      });
    },
    [setValue]
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Invite User</ModalHeader>
          <ModalBody>
            <Form>
              <Controller
                name="community"
                control={control}
                rules={{
                  required: "Please enter a community name",
                  validate: (value) => {
                    if (!COMMUNITY_REGEX.test(value)) {
                      return "Invalid community name";
                    }
                    return true;
                  },
                }}
                render={({ field, fieldState }) => (
                  <Autocomplete
                    {...field}
                    label="Community Name"
                    labelPlacement="outside"
                    placeholder="Enter your community name"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    isLoading={isLoading}
                    value={field.value}
                    defaultInputValue={defaultCommunity}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                    onInputChange={debounce((value) => {
                      if (value === field.value) return;
                      setSearchCommunity(value);
                    }, 500)}
                    onSelectionChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    {communities.map((it) => (
                      <AutocompleteItem key={it.name}>
                        {it.name}
                      </AutocompleteItem>
                    ))}
                  </Autocomplete>
                )}
              />
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
                  <Input
                    {...field}
                    label="User Address"
                    labelPlacement="outside"
                    placeholder="Enter a user address"
                    isInvalid={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                  />
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
                      Payment
                    </Button>
                  </div>
                )}
              />
            </Form>
          </ModalBody>
          <ModalFooter>
            <div className="flex gap-2">
              <Button
                color="primary"
                type="submit"
                onPress={() => handleSubmit(onSubmit)()}
              >
                Submit
              </Button>
              <Button type="reset" variant="flat" onPress={() => reset()}>
                Reset
              </Button>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <PaymentModal
        isOpen={isOpenPaymentModal}
        onClose={() => setIsOpenPaymentModal(false)}
        toAddress={toAddress}
        amount={paymentAmount}
        onSuccess={onPaymentSuccess}
      />
    </>
  );
}
