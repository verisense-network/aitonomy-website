import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { StepType, useTour } from "@reactour/tour";
import { useEffect } from "react";

export type LearnCardProps = {
  title: string;
  content: React.ReactNode;
  steps: StepType[];
};

export default function LearnCard({ title, content, steps }: LearnCardProps) {
  const { setSteps, setIsOpen } = useTour();

  useEffect(() => {
    setSteps?.(steps);
  }, [steps, setSteps]);

  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardBody>{content}</CardBody>
      <CardFooter>
        <Button onPress={() => setIsOpen(true)}>Start</Button>
      </CardFooter>
    </Card>
  );
}
