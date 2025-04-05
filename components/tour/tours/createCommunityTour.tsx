import { useModalStore } from "@/stores/modal";
import { LearnStep } from "../LearnCard";

export const createCommunityTour: LearnStep = {
  title: "Create a community",
  content: <>learn how to create a community</>,
  steps: [
    {
      selector: ".create-community-step1",
      content: "Click + and select Create Community",
      actionAfter() {
        useModalStore.getState().setIsShowCreateCommunity(true);
      },
    },
    {
      selector: ".create-community-step2",
      position: "center",
      content: "Enter the details and click Submit",
    },
  ],
};
