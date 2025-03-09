"use client";

import { parseMarkdown } from "@/utils/markdown";

export default function RenderContent({ content }: { content: string }) {
  return (
    <div
      className="prose max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{
        __html: parseMarkdown(content.trim()),
      }}
    ></div>
  );
}
