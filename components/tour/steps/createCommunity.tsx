import { Tour } from "onborda/dist/types";

export const createCommunity: Tour = {
  tour: "create-community",
  steps: [
    {
      icon: <>👋</>,
      title: "Welcome to Aitonomy!",
      content: (
        <>
          Welcome to Aitonomy, a platform for creating and managing communities!
        </>
      ),
      selector: "#create-community-step1",
      side: "bottom",
      showControls: true,
      pointerPadding: -1,
      pointerRadius: 24,
    },
    {
      icon: <>🪄</>,
      title: "It's like magic!",
      content: (
        <>
          Aitonomy uses <b>framer-motion</b> to handle animations and{" "}
          <b>reactour</b> to handle the onboarding flow.
        </>
      ),
      selector: "#create-community-step2",
      side: "top",
      showControls: true,
      pointerPadding: -1,
      pointerRadius: 24,
    },
    {
      icon: <>🎩</>,
      title: "Works across routes!",
      content: (
        <>
          Aitonomy uses <b>framer-motion</b> to handle animations and{" "}
          <b>reactour</b> to handle the onboarding flow.
        </>
      ),
      selector: "#create-community-step3",
      side: "top",
      showControls: true,
      pointerPadding: -1,
      pointerRadius: 24,
    },
  ],
};
