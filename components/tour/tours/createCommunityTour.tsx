import { LearnCardProps } from "../LearnCard";

export const createCommunityTour: LearnCardProps = {
  title: "Create a community",
  content: <>learn how to create a community</>,
  steps: [
    {
      selector: ".create-community-step1",
      content:
        "This step is attached to the bottom of the <code>.create-community-step1</code> element.",
      action(elem) {},
    },
    {
      selector: ".create-community-step2",
      content:
        "This step is attached to the bottom of the <code>.create-community-step2</code> element.",
    },
  ],
};
