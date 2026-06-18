import { z } from "zod";
import type { JSONContent } from "@tiptap/react";

const documentContentSchema = z.custom<JSONContent>(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as Record<string, unknown>).type === "string",
  {
    message: "Document content must be valid JSON",
  },
);

export const documentCreateSchema = z.object({
  title: z.string().trim().min(1).max(100).default("Untitled Document"),
});

export const documentUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(100).optional(),
    content: documentContentSchema.optional(),
  })
  .refine((data) => data.title !== undefined || data.content !== undefined, {
    message: "At least one field must be provided.",
  });
