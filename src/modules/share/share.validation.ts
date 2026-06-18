import { z } from "zod";

export const shareDocumentSchema = z.object({
  documentId: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["viewer", "commenter", "editor"]).default("editor"),
});

export const updateShareRoleSchema = z.object({
  documentId: z.string().min(1),
  userId: z.string().min(1),
  role: z.enum(["viewer", "commenter", "editor"]),
});

export const removeShareSchema = z.object({
  documentId: z.string().min(1),
  userId: z.string().min(1),
});
