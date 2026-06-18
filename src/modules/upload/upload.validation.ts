import { z } from "zod";

export const uploadSchema = z.object({
  name: z.string().min(1),
  size: z.number().max(5 * 1024 * 1024),
});
