import { termsOfServiceDocs } from "../docs";
import RenderContent from "@/components/legal/RenderContent";

export default function TermsOfService() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderContent content={termsOfServiceDocs} />
      </div>
    </div>
  );
}
