import { termsOfServiceDocs } from "../docs";
import RenderMarkdown from "@/components/markdown/RenderMarkdown";

export default function TermsOfService() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown content={termsOfServiceDocs} />
      </div>
    </div>
  );
}
