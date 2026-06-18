import type { JSONContent } from "@tiptap/react";

export function tiptapJsonToMarkdown(content: JSONContent | null | undefined): string {
  if (!content) {
    return "";
  }
  
  function walk(node: JSONContent): string {
    if (!node) {
      return "";
    }

    switch (node.type) {
      case "doc":
        return node.content?.map(walk).join("\n\n") || "";
      case "heading":
        const level = node.attrs?.level || 1;
        const headingText = node.content?.map(walk).join("") || "";
        return `${"#".repeat(level)} ${headingText}`;
      case "paragraph":
        return node.content?.map(walk).join("") || "";
      case "bulletList":
        return node.content?.map((item) => `* ${walk(item).trim()}`).join("\n") || "";
      case "orderedList":
        return node.content?.map((item, idx) => `${idx + 1}. ${walk(item).trim()}`).join("\n") || "";
      case "listItem":
        return node.content?.map(walk).join("") || "";
      case "text":
        let textValue = node.text || "";
        if (node.marks) {
          for (const mark of node.marks) {
            if (mark.type === "bold") {
              textValue = `**${textValue}**`;
            }
            if (mark.type === "italic") {
              textValue = `*${textValue}*`;
            }
            if (mark.type === "code") {
              textValue = `\`${textValue}\``;
            }
            if (mark.type === "underline") {
              textValue = `<u>${textValue}</u>`;
            }
            if (mark.type === "strike") {
              textValue = `~~${textValue}~~`;
            }
          }
        }
        return textValue;
      default:
        return "";
    }
  }

  return walk(content);
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
