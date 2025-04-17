import RenderMarkdown from "@/components/markdown/RenderMarkdown";
import { privacyPolicyDocs } from "../docs";

export default function PrivacyPolicy() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <RenderMarkdown markdown={privacyPolicyDocs} />
      </div>
    </div>
  );
}
