import RenderMarkdown from "@/components/markdown/RenderMarkdown";
import { incentivePlanDocs } from "../docs";

export default function IncentivePlan() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown content={incentivePlanDocs} />
      </div>
    </div>
  );
}
