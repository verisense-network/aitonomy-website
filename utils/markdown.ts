import DOMPurify from "dompurify";
import { parse } from "marked";

export function parseMarkdown(markdownText: string) {
  return DOMPurify.sanitize(
    parse(markdownText, {
      async: false,
    })
  );
}
