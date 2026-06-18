import { describe, it, expect } from "vitest";
import { tiptapJsonToMarkdown } from "@/features/documents/utils/export";

describe("Document Export Utility", () => {
  it("converts simple Tiptap JSON content to Markdown correctly", () => {
    const json = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "My Title" }],
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "This is " },
            { type: "text", marks: [{ type: "bold" }], text: "bold" },
            { type: "text", text: " and " },
            { type: "text", marks: [{ type: "italic" }], text: "italic" },
            { type: "text", text: " text." },
          ],
        },
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 1" }],
                },
              ],
            },
            {
              type: "listItem",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: "Item 2" }],
                },
              ],
            },
          ],
        },
      ],
    };

    const markdown = tiptapJsonToMarkdown(json);
    expect(markdown).toContain("# My Title");
    expect(markdown).toContain("This is **bold** and *italic* text.");
    expect(markdown).toContain("* Item 1");
    expect(markdown).toContain("* Item 2");
  });
});
