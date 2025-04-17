"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import { useCallback, useEffect } from "react";
import { welcomeDoc } from "./docs";
import { useAppearanceStore } from "@/stores/appearance";
import RenderMarkdown from "../markdown/RenderMarkdown";
import LearnModal from "../tour/LearnModal";
import { GraduationCapIcon } from "lucide-react";

export default function WelcomeModal() {
  const {
    isOpen: learnModalIsOpen,
    onOpen: onLearnModalOpen,
    onOpenChange: onLearnModalChange,
  } = useDisclosure();
  const {
    welcomeModalIsOpen,
    setWelcomeModalIsOpen,
    setWelcomeModalIsReabled,
  } = useAppearanceStore();

  useEffect(() => {
    if (!useAppearanceStore.getState().welcomeModalIsReabled) {
      setWelcomeModalIsOpen(true);
    }
  }, [setWelcomeModalIsOpen]);

  const onModalClose = useCallback(() => {
    setWelcomeModalIsOpen(false);
    setWelcomeModalIsReabled(true);
  }, [setWelcomeModalIsOpen, setWelcomeModalIsReabled]);

  const onLearnOpen = useCallback(() => {
    onLearnModalOpen();
    onModalClose();
  }, [onLearnModalOpen, onModalClose]);

  return (
    <>
      <Modal
        isOpen={welcomeModalIsOpen}
        onClose={onModalClose}
        size="4xl"
        classNames={{
          body: "max-h-[75vh] overflow-y-auto md:max-h-[95vh]",
        }}
      >
        <ModalContent>
          {(_onClose) => (
            <>
              <ModalHeader className="text-lg font-semibold">
                How it works
              </ModalHeader>
              <ModalBody>
                <RenderMarkdown markdown={welcomeDoc} />
              </ModalBody>
              <ModalFooter>
                <Button
                  startContent={<GraduationCapIcon className="w-5 h-5" />}
                  onPress={onLearnOpen}
                >
                  Learn
                </Button>
                <Button color="primary" onPress={onModalClose}>
                  I&apos;m ready to have fun!
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <LearnModal isOpen={learnModalIsOpen} onClose={onLearnModalChange} />
    </>
  );
}
