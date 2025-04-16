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
import { cleanContent } from "./utils";

SyntaxHighlighter.registerLanguage("ts", typescript);
SyntaxHighlighter.registerLanguage("js", javascript);
SyntaxHighlighter.registerLanguage("rust", rust);

const renderer: Partial<ReactRenderer> = {
  link(href, text) {
    const url = new URL(href);
    const hrefFormat = url.href.replace(/\/_/g, "_");
    const textFormat = (text as string[])?.map?.(
      (item) =>
        (item && typeof item === "string" && item.replace(/\\/g, "")) || item
    );
    return (
      <Link
        key={hrefFormat}
        href={hrefFormat}
        target={url.origin === window.location.origin ? "_self" : "_blank"}
        rel={url.origin === window.location.origin ? "" : "noopener noreferrer"}
      >
        {textFormat}
      </Link>
    );
  },
  code(snippet: string, lang: string) {
    return (
      <SyntaxHighlighter key={snippet} language={lang} style={atomOneDark}>
        {snippet}
      </SyntaxHighlighter>
    );
  },
  image(src, alt, title) {
    // 检测是否为emoji
    if (src.includes("emoji")) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="inline-block mx-1 mt-0 mb-0 my-1 w-4 h-4"
          src={src}
          alt={alt}
          title={title || ""}
        />
      );
    }
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} title={title || ""} />;
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
    : content;

  return (
    <div className="prose md:prose-img:max-w-2xl md:prose-img:max-h-[60vh] max-w-none dark:prose-invert">
      <Markdown
        value={cleanContent(
          typeof window !== "undefined"
            ? DOMPurify.sanitize(truncateContent)
            : truncateContent
        )}
        renderer={renderer as ReactRenderer}
      />
    </div>
  );
}
