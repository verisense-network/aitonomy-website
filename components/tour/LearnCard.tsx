import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { StepType, useTour } from "@reactour/tour";
import { useEffect } from "react";

type LearnCardProps = {
  title: string;
  content: React.ReactNode;
  steps: StepType[];
  closeLearnModal: () => void;
};

export type LearnStep = Omit<LearnCardProps, "closeLearnModal">;

export default function LearnCard({
  title,
  content,
  steps,
  closeLearnModal,
}: LearnCardProps) {
  const { setSteps, setCurrentStep, setIsOpen } = useTour();

  useEffect(() => {
    setSteps?.(steps);
  }, [steps, setSteps]);

  const handleStart = () => {
    setIsOpen(true);
    setCurrentStep(0);
    closeLearnModal();
  };

  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardBody>{content}</CardBody>
      <CardFooter>
        <Button onPress={handleStart}>Start</Button>
      </CardFooter>
    </Card>
  );
}
