import RenderMarkdown from "@/components/markdown/RenderMarkdown";
import { feeDocs } from "../docs";

export default function Fee() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown content={feeDocs} />
      </div>
    </div>
  );
}
