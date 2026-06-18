import { NextResponse } from "next/server";
import { generateJSON } from "@tiptap/html";
import BulletList from "@tiptap/extension-bullet-list";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { marked } from "marked";

import { AppError } from "@/modules/shared/errors";
import { EMPTY_DOCUMENT_CONTENT } from "@/modules/shared/constants";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      ...data,
    },
    { status },
  );
}

export function errorResponse(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: error.status },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: "Something went wrong.",
    },
    { status: 500 },
  );
}

export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getEditorExtensions() {
  return [
    StarterKit.configure({
      heading: false,
      bulletList: false,
      orderedList: false,
    }),
    Underline,
    Heading.configure({
      levels: [1, 2],
    }),
    BulletList,
    OrderedList,
  ];
}

import type { JSONContent } from "@tiptap/react";

export function normalizeDocumentContent(content?: JSONContent | null) {
  if (!content?.type) {
    return EMPTY_DOCUMENT_CONTENT;
  }

  return content;
}

export function textToDocumentContent(text: string): JSONContent {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: "paragraph",
      content: paragraph.split(/\r?\n/).flatMap((line, index, lines) => {
        const nodes: JSONContent[] = [{ type: "text", text: line }];

        if (index < lines.length - 1) {
          nodes.push({ type: "hardBreak" });
        }

        return nodes;
      }),
    }));

  return {
    type: "doc",
    content: paragraphs.length ? paragraphs : EMPTY_DOCUMENT_CONTENT.content,
  };
}

export function markdownToDocumentContent(markdown: string): JSONContent {
  const html = marked.parse(markdown, { async: false }) as string;
  return normalizeDocumentContent(generateJSON(html, getEditorExtensions()));
}

export function titleFromFilename(filename: string) {
  const withoutExtension = filename.replace(/\.[^.]+$/, "").trim();
  return withoutExtension || "Imported Document";
}
