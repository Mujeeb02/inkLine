import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
  nextPath: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || !value.startsWith("/")) {
        return undefined;
      }
      return value;
    }),
});

export const quickLoginSchema = z.object({
  email: z.string().email(),
  nextPath: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || !value.startsWith("/")) {
        return undefined;
      }
      return value;
    }),
});

export const signUpSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Za-z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  nextPath: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || !value.startsWith("/")) {
        return undefined;
      }
      return value;
    }),
});
