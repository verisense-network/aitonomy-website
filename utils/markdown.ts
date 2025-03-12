import DOMPurify from "dompurify";
import { parse } from "marked";
import { ethers } from "ethers";
import bs58 from "bs58";
import { CHAIN } from "./chain";

export function parseMarkdown(markdownText: string) {
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(
      parse(markdownText, {
        async: false,
      })
    );
  }
  return parse(markdownText, {
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
