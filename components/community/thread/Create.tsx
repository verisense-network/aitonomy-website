import ThreadCreate from "@/components/thread/Create";
import {
  Card,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { Suspense, useCallback, useEffect, useState } from "react";

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

  const openCreateModal = useCallback(async () => {
    if (!communityName) {
      await reloadCommunity?.();
    }
    console.log("communityName", communityName);
    setIsOpen(true);
  }, [communityName, reloadCommunity]);

  return (
    <>
      <Card
        className="flex w-full text-right px-6 py-6 hover:bg-gray-200"
        isPressable
        onPress={() => openCreateModal()}
      >
        <div className="flex items-center space-x-4">
          <span className="text-lg text-gray-500">What&apos;s new?</span>
        </div>
      </Card>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        isDismissable={false}
        size="2xl"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create</ModalHeader>
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
