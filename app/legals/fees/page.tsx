import { feesDocs } from "../docs";
import RenderContent from "@/components/legal/RenderContent";

export default function Fees() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderContent content={feesDocs} />
      </div>
    </div>
  );
}
