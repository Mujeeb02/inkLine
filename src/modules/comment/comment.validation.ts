import { z } from "zod";

export const addCommentSchema = z.object({
  body: z.string().min(1).max(2000),
  selection: z
    .object({
      from: z.number(),
      to: z.number(),
      text: z.string(),
    })
    .optional(),
});
