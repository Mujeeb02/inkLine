import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required."),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export function getEnv() {
  const parsed = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.flatten().formErrors.join(" "));
  }

  return parsed.data;
}
