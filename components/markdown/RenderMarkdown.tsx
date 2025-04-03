"use client";
import DOMPurify from "dompurify";
import Markdown from "marked-react";
import { LightAsync as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import typescript from "react-syntax-highlighter/dist/esm/languages/hljs/typescript";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import rust from "react-syntax-highlighter/dist/esm/languages/hljs/rust";
import Link from "next/link";
import truncateMarkdown from "markdown-truncate";
import { ReactRenderer } from "marked-react";

SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("rust", rust);

const renderer: Partial<ReactRenderer> = {
  link(href, text) {
    return (
      <Link href={href} target={href.startsWith("http") ? "_blank" : "_self"}>
        {text}
      </Link>
    );
  },
  code(snippet: string, lang: string) {
    return (
      <SyntaxHighlighter language={lang} style={atomOneDark}>
        {snippet}
      </SyntaxHighlighter>
    );
  },
};

interface RenderMarkdownProps {
  content: string;
  truncate?: number;
}

export default function RenderMarkdown({
  content,
  truncate,
}: RenderMarkdownProps) {
  const truncateContent = truncate
    ? truncateMarkdown(content.trim(), {
        limit: truncate,
        ellipsis: true,
      })
    : content.trim();

  return (
    <div className="prose max-w-none dark:prose-invert">
      <Markdown
        value={
          typeof window !== "undefined"
            ? DOMPurify.sanitize(truncateContent)
            : truncateContent
        }
        renderer={renderer as ReactRenderer}
      />
    </div>
  );
}
