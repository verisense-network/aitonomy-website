"use client";

import { parseMarkdown } from "@/utils/markdown";

const docs = `
Dear Valued Users,

We are delighted to welcome you to the exclusive, invite-only internal environment of AItonomy.world. During this phase, you can explore and utilize our platform without any associated fees.

Please note that any future updates regarding our fee structure will be communicated through official announcements on our website. We encourage you to visit our site regularly to stay informed about the latest developments.

Thank you for being an integral part of our early community. Your participation and feedback are invaluable as we continue to enhance AItonomy.world.

Warm regards,

The AItonomy.world Team
`;

export default function PrivacyPolicy() {
  return (
    <div className="w-full">
      <div className="mt-3 py-2">
        <div
          className="prose max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: parseMarkdown(docs.trim()),
          }}
        ></div>
      </div>
    </div>
  );
}
