import DOMPurify from "dompurify";
import { parse } from "marked";

export function parseMarkdown(markdownText: string) {
  if (typeof window !== 'undefined') {
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
