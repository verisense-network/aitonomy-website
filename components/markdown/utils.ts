export const cleanContent = (content: string) => {
  return content.replace(/&#x20;/g, "").trim();
};
