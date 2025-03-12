import ThreadCreate from "@/components/thread/Create";
import { useUserStore } from "@/stores/user";
import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Suspense, useCallback, useState } from "react";
import { toast } from "react-toastify";
import dayjs from "@/lib/dayjs";
import { Lock } from "@/components/Lock";

interface Props {
  communityName?: string;
  replyTo?: string;
  onSuccess: (id: string) => void;
  reloadCommunity?: () => void;
}

export default function CreateThread({
  communityName,
  replyTo,
  onSuccess,
  reloadCommunity,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { isLogin, lastPostAt } = useUserStore();

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

  console.log("lastPostAt", lastPostAt);
  const countdownTime = lastPostAt
    ? dayjs(lastPostAt).add(1, "m").valueOf()
    : 0;
  console.log("countdownTime", countdownTime);

  return (
    <>
      <div className="relative">
        {countdownTime > 0 && <Lock countdownTime={countdownTime} />}
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
