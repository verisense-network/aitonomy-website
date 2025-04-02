import { getInviteTickets } from "@/app/actions";
import useMeilisearch from "@/hooks/useMeilisearch";
import { InviteUserArg } from "@/utils/aitonomy";
import { COMMUNITY_REGEX } from "@/utils/aitonomy/tools";
import { debounce } from "@/utils/tools";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Autocomplete,
  AutocompleteItem,
  Tabs,
  Tab,
} from "@heroui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Id, toast } from "react-toastify";
import PaymentModal from "../modal/Payment";
import InviteUserForm from "./InviteUserForm";
import BuyInviteCodeForm from "./BuyInviteCodeForm";

interface InviteUserProps {
  isOpen: boolean;
  community?: any;
  onSuccess: () => void;
  onClose: () => void;
}
export default function InviteUser({
  isOpen,
  community,
  onSuccess,
  onClose,
}: InviteUserProps) {
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [currentCommunity, setCurrentCommunity] = useState(community);
  const [tab, setTab] = useState<"invite" | "buy">("invite");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [inviteTickets, setInviteTickets] = useState(0);
  const [txHash, setTxHash] = useState("");

  const { control, setValue, watch } = useForm<InviteUserArg>({
    defaultValues: {
      community: community?.name || "",
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
  const selectedCommunity = watch("community");

  useEffect(() => {
    if (!selectedCommunity && community?.name) {
      setValue("community", community.name);
    }
  }, [selectedCommunity, community, setValue]);

  useEffect(() => {
    if (!currentCommunity && community) {
      setCurrentCommunity(community);
    }
  }, [community, currentCommunity]);

  const communities = useMemo(
    () => communitiesData?.hits ?? [],
    [communitiesData]
  );

  const toAddress = currentCommunity?.agent_pubkey;

  useEffect(() => {
    if (selectedCommunity) {
      const c = communities.find((c) => c.name === selectedCommunity);
      if (!c) {
        return;
      }
      setCurrentCommunity(c);
    }
  }, [selectedCommunity, communities, setCurrentCommunity]);

  const refreshInviteTickets = useCallback(async () => {
    if (!toAddress || !currentCommunity) {
      return;
    }
    const { data: amount, success } = await getInviteTickets({
      accountId: currentCommunity.creator,
      communityId: currentCommunity.id,
    });
    if (!success) {
      throw new Error("Failed: get invitecode amount error");
    }
    setInviteTickets(Number(amount));
  }, [toAddress, currentCommunity]);

  useEffect(() => {
    refreshInviteTickets();
  }, [refreshInviteTickets]);

  const onPaymentSuccess = useCallback((tx: string, toastId: Id) => {
    setIsOpenPaymentModal(false);
    setTxHash(tx);
    toast.update(toastId, {
      render: "successful, transaction has been set",
      type: "success",
      isLoading: false,
      autoClose: 2000,
    });
  }, []);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Invite User</ModalHeader>
          <ModalBody>
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
                  defaultInputValue={community?.name || ""}
                  isDisabled={!!field.value}
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
                    <AutocompleteItem key={it.name}>{it.name}</AutocompleteItem>
                  ))}
                </Autocomplete>
              )}
            />
            <div className="w-full text-zinc-400">
              <p className="text-small">Payment Address</p>
              <div className="flex space-x-2 w-full">
                <div className="px-3 py-2 mt-2 text-sm bg-zinc-800 rounded-xl w-full">
                  {toAddress}
                </div>
              </div>
            </div>
            <Tabs
              aria-label="Invite User Tabs"
              selectedKey={tab}
              onSelectionChange={(key) => setTab(key as "invite" | "buy")}
            >
              <Tab key="invite" title="Invite">
                <InviteUserForm
                  community={currentCommunity}
                  setTab={setTab}
                  invitecodeAmount={inviteTickets}
                  onSuccess={onSuccess}
                />
              </Tab>
              <Tab key="buy" title="Buy code">
                <BuyInviteCodeForm
                  community={currentCommunity}
                  inviteTickets={inviteTickets}
                  setIsOpenPaymentModal={setIsOpenPaymentModal}
                  txHash={txHash}
                  paymentAmount={paymentAmount}
                  setPaymentAmount={setPaymentAmount}
                  refreshInvitecodeAmount={refreshInviteTickets}
                />
              </Tab>
            </Tabs>
          </ModalBody>
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
