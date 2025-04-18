import RenderMarkdown from "@/components/markdown/RenderMarkdown";
import { termsOfServiceDocs } from "../docs";

export default function TermsOfService() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown markdown={termsOfServiceDocs} />
      </div>
    </div>
  );
}
