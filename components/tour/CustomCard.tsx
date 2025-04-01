"use client";
import React from "react";
import { Button, Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import type { CardComponentProps } from "onborda";
import { useOnborda } from "onborda";
import confetti from "canvas-confetti";

const CustomCard: React.FC<CardComponentProps> = ({
  step,
  currentStep,
  totalSteps,
  nextStep,
  prevStep,
  arrow,
}) => {
  const { closeOnborda } = useOnborda();

  function handleConfetti() {
    closeOnborda();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  return (
    <Card className="border-0 rounded-3xl max-w-vw">
      <CardHeader>
        {step.icon} {step.title}{" "}
        <span>
          {currentStep + 1} of {totalSteps}
        </span>
      </CardHeader>
      <CardBody>{step.content}</CardBody>
      <CardFooter>
        <div className="flex justify-between w-full">
          {currentStep !== 0 && (
            <Button onPress={() => prevStep()}>Previous</Button>
          )}
          {currentStep + 1 !== totalSteps && (
            <Button onPress={() => nextStep()} className="ml-auto">
              Next
            </Button>
          )}
          {currentStep + 1 === totalSteps && (
            <Button onPress={() => handleConfetti()} className="ml-auto">
              🎉 Finish!
            </Button>
          )}
        </div>
      </CardFooter>
      <span className="text-card">{arrow}</span>
    </Card>
  );
};

export default CustomCard;
