import DOMPurify from "dompurify";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { ethers } from "ethers";
import bs58 from "bs58";
import { CHAIN } from "./chain";

export function parseMarkdown(markdownText: string) {
  const marked = new Marked(
    markedHighlight({
      emptyLangClass: "hljs",
      langPrefix: "hljs language-",
      highlight(code, lang, _info) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(
      marked.parse(markdownText, {
        async: false,
      })
    );
  }
  return marked.parse(markdownText, {
    async: false,
  });
}

export function extractMarkdownImages(markdownText: string): string[] {
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  const imageUrls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdownText)) !== null) {
    imageUrls.push(match[2]);
  }

  return imageUrls;
}

export function extractMentions(markdownText: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_]+)/g;

  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(markdownText)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

export function mentionsToAccountId(mentions: string[]): Uint8Array[] {
  return mentions.map((mention) => {
    if (CHAIN === "SOL") {
      return bs58.decode(mention);
    } else {
      return ethers.toBeArray(mention);
    }
  });
}
