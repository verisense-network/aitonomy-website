import ThreadCreate from "@/components/thread/Create";
import { useUserStore } from "@/stores/user";
import {
  Alert,
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Lock } from "@/components/Lock";
import { updateAccountInfo } from "@/utils/user";
import { checkInvite } from "@/app/actions";
import { hexToLittleEndian } from "@/utils/tools";

interface Props {
  communityName?: string;
  communityId?: string;
  replyTo?: string;
  onSuccess: (id: string) => void;
  reloadCommunity?: () => void;
}

export default function CreateThread({
  communityName,
  communityId,
  replyTo,
  onSuccess,
  reloadCommunity,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLogin, lastPostAt, address } = useUserStore();
  const [canPost, setCanPost] = useState(true);

  const openCreateModal = useCallback(async () => {
    if (!isLogin) {
      toast.info("Please login first");
      return;
    }
    if (!communityName) {
      await reloadCommunity?.();
    }
    setIsOpen(true);
  }, [communityName, isLogin, reloadCommunity]);

  const checkCanPost = useCallback(async () => {
    try {
      if (!communityId || !isLogin) return;
      console.log("checkCanPost", communityId);

      const { data: permission, success } = await checkInvite({
        communityId: hexToLittleEndian(communityId),
        accountId: address,
      });

      if (!success) {
        setCanPost(false);
        return;
      }

      console.log("permission", permission);

      setCanPost(!!permission);
    } catch (e: any) {
      console.error("checkCanPost error", e);
      setCanPost(false);
    }
  }, [communityId, address, isLogin]);

  useEffect(() => {
    updateAccountInfo();
    checkCanPost();
  }, [checkCanPost]);

  return (
    <>
      <div className="relative">
        {!canPost && <Alert title="You are not allowed to post" />}
        {canPost && <Lock countdownTime={lastPostAt || 0} />}
        <Card
          className="flex w-full text-right px-6 py-6 hover:bg-gray-200 dark:hover:bg-zinc-800"
          isPressable
          onPress={() => openCreateModal()}
        >
          <div className="flex items-center space-x-4">
            <span className="text-lg text-gray-500">What&apos;s new?</span>
          </div>
        </Card>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isDismissable={false}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Post thread</ModalHeader>
              <ModalBody>
                <Suspense>
                  {isOpen && (
                    <ThreadCreate
                      onClose={onClose}
                      defaultCommunity={communityName}
                      replyTo={replyTo}
                    />
                  )}
                </Suspense>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
