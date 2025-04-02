import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { createCommunityTour } from "./tours/createCommunityTour";
import LearnCard from "./LearnCard";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Learn({ isOpen, setIsOpen }: Props) {
  const learnTours = [createCommunityTour];

  return (
    <>
      <span>Learn</span>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ModalContent>
          <ModalHeader>Learn</ModalHeader>
          <ModalBody>
            <div>
              {learnTours.map((tour) => (
                <LearnCard key={tour.title} {...tour} />
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
