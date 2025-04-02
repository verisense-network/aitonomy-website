"use client";

import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import Rewards from "../user/Rewards";

interface TokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  community: any;
}

export default function TokenRewardsModal({
  isOpen,
  onClose,
  community,
}: TokenModalProps) {
  if (!community) return;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      classNames={{
        body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-lg font-semibold">
              {community.token_info?.name} Rewards
            </ModalHeader>
            <ModalBody>
              <Rewards
                communityId={community.id}
                agentContract={community.agent_contract}
              />
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
