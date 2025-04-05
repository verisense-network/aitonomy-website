import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { createCommunityTour } from "./tours/createCommunityTour";
import LearnCard from "./LearnCard";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LearnModal({ isOpen, onClose }: Props) {
  const learnTours = [createCommunityTour];

  return (
    <>
      <Modal
        isOpen={isOpen}
        classNames={{
          body: "max-h-[85vh] overflow-y-auto md:max-h-[95vh]",
        }}
        onClose={() => onClose()}
      >
        <ModalContent>
          <ModalHeader>Learn</ModalHeader>
          <ModalBody>
            <div>
              {learnTours.map((tour) => (
                <LearnCard
                  key={tour.title}
                  {...tour}
                  closeLearnModal={() => onClose()}
                />
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
