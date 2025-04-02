"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@heroui/react";
import { useCallback, useEffect } from "react";
import { parseMarkdown } from "@/utils/markdown";
import { welcomeDoc } from "./docs";
import { useAppearanceStore } from "@/stores/appearance";

export default function WelcomeModal() {
  const {
    welcomeModalIsOpen,
    setWelcomeModalIsOpen,
    setWelcomeModalIsReabled,
  } = useAppearanceStore();

  useEffect(() => {
    if (!useAppearanceStore.getState().welcomeModalIsReabled) {
      console.log("show welcome modal");
      setWelcomeModalIsOpen(true);
    }
  }, [setWelcomeModalIsOpen]);

  const onModalClose = useCallback(() => {
    setWelcomeModalIsOpen(false);
    setWelcomeModalIsReabled(true);
  }, [setWelcomeModalIsOpen, setWelcomeModalIsReabled]);

  return (
    <Modal
      isOpen={welcomeModalIsOpen}
      onClose={onModalClose}
      size="4xl"
      classNames={{
        body: "max-h-[75vh] overflow-y-auto md:max-h-[95vh]",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-lg font-semibold">
              How it works
            </ModalHeader>
            <ModalBody>
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(welcomeDoc.trim()),
                }}
              ></div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onModalClose}>
                I&apos;m ready to have fun!
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
