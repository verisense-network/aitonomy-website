import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { useState } from "react";
import { isCommunityMode } from "../community/utils";

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

  // const { control, setValue, watch } = useForm<JoinCommunityArg>({
  //   defaultValues: {
  //     community: community?.name || "",
  //   },
  // });

  // const [searchCommunity, setSearchCommunity] = useState("");

  // const { data: communitiesData, isLoading } = useMeilisearch(
  //   "community",
  //   searchCommunity,
  //   {
  //     limit: 10,
  //   }
  // );
  // const selectedCommunity = watch("community");

  // useEffect(() => {
  //   if (!selectedCommunity && community?.name) {
  //     setValue("community", community.name);
  //   }
  // }, [selectedCommunity, community, setValue]);

  // useEffect(() => {
  //   if (!currentCommunity && community) {
  //     setCurrentCommunity(community);
  //   }
  // }, [community, currentCommunity]);

  // const communities = useMemo(
  //   () => communitiesData?.hits ?? [],
  //   [communitiesData]
  // );

  // const toAddress = currentCommunity?.agent_pubkey;

  // useEffect(() => {
  //   if (selectedCommunity) {
  //     const c = communities.find((c) => c.name === selectedCommunity);
  //     if (!c) {
  //       return;
  //     }
  //     setCurrentCommunity(c);
  //   }
  // }, [selectedCommunity, communities, setCurrentCommunity]);

  // const refreshInviteTickets = useCallback(async () => {
  //   if (!toAddress || !currentCommunity) {
  //     return;
  //   }
  //   const { data: amount, success } = await getInviteTickets({
  //     accountId: currentCommunity.creator,
  //     communityId: currentCommunity.id,
  //   });
  //   if (!success) {
  //     throw new Error("Failed: get invitecode amount error");
  //   }
  //   setInviteTickets(Number(amount));
  // }, [toAddress, currentCommunity]);

  // const getInvitePaymentFee = useCallback(async () => {
  //   if (inviteFee !== 0) {
  //     return;
  //   }
  //   const { data: amount, success } = await getInviteFee();
  //   if (!success) {
  //     throw new Error("Failed: get inviteFee error");
  //   }
  //   setInviteFee(Number(amount));
  // }, [inviteFee, setInviteFee]);

  // useEffect(() => {
  //   refreshInviteTickets();
  //   getInvitePaymentFee();
  // }, [refreshInviteTickets, getInvitePaymentFee]);

  // const onPaymentSuccess = useCallback((tx: string, toastId: Id) => {
  //   setIsOpenPaymentModal(false);
  //   setTxHash(tx);
  //   toast.update(toastId, {
  //     render: "successful, transaction has been set",
  //     type: "success",
  //     isLoading: false,
  //     autoClose: 2000,
  //   });
  // }, []);

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
            {isCommunityMode(currentCommunity?.mode, "InviteOnly") && (
              <>
                <div>
                  <p className="text-small">Community Creator Address</p>
                  <div className="flex space-x-2 w-full">
                    <div className="px-3 py-2 mt-2 text-sm bg-zinc-800 rounded-xl w-full">
                      {currentCommunity.creator}
                    </div>
                  </div>
                </div>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
