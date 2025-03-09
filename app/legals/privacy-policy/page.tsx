import { privacyPolicyDocs } from "../docs";
import RenderContent from "@/components/legal/RenderContent";

export default function PrivacyPolicy() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderContent content={privacyPolicyDocs} />
      </div>
    </div>
  );
}
