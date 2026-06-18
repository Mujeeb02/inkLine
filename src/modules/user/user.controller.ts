import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, SEEDED_USERS } from "@/modules/shared/constants";
import { UserService } from "./user.service";
import { loginSchema, quickLoginSchema, signUpSchema } from "./user.validation";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

async function setSessionCookie(email: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, email, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export class UserController {
  /**
   * Full login with email + password.
   */
  static async login(
    emailInput: string | null,
    passwordInput: string | null,
    nextPathInput: string | null,
  ) {
    const parsed = loginSchema.safeParse({
      email: emailInput,
      password: passwordInput,
      nextPath: nextPathInput || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message;
      return { success: false, error: firstError || "invalid-credentials" };
    }

    const { email, password, nextPath } = parsed.data;

    await UserService.ensureSeedUsers();

    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "user-not-found" };
    }

    // Seeded users have no passwordHash – disallow password login for them
    if (!user.passwordHash) {
      return { success: false, error: "use-quick-login" };
    }

    const valid = await UserService.verifyPassword(email, password);
    if (!valid) {
      return { success: false, error: "invalid-password" };
    }

    await setSessionCookie(email);
    return { success: true, nextPath: nextPath || "/dashboard" };
  }

  /**
   * Quick-login for developer seeded users (no password required).
   * Only works for emails in SEEDED_USERS.
   */
  static async quickLogin(emailInput: string | null, nextPathInput: string | null) {
    const parsed = quickLoginSchema.safeParse({
      email: emailInput,
      nextPath: nextPathInput || undefined,
    });

    if (!parsed.success) {
      return { success: false, error: "invalid-user" };
    }

    const { email, nextPath } = parsed.data;

    const isSeeded = SEEDED_USERS.some((u) => u.email === email);
    if (!isSeeded) {
      return { success: false, error: "user-not-found" };
    }

    await UserService.ensureSeedUsers();

    const user = await UserService.getUserByEmail(email);
    if (!user) {
      return { success: false, error: "user-not-found" };
    }

    await setSessionCookie(email);
    return { success: true, nextPath: nextPath || "/dashboard" };
  }

  /**
   * Signup with email + password.
   */
  static async signUp(
    emailInput: string | null,
    passwordInput: string | null,
    nextPathInput: string | null,
  ) {
    const parsed = signUpSchema.safeParse({
      email: emailInput,
      password: passwordInput,
      nextPath: nextPathInput || undefined,
    });

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message;
      return { success: false, error: firstError || "invalid-email" };
    }

    const { email, password, nextPath } = parsed.data;

    await UserService.ensureSeedUsers();

    const existingUser = await UserService.getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: "user-exists" };
    }

    await UserService.createUser(email, password);

    await setSessionCookie(email);
    return { success: true, nextPath: nextPath || "/dashboard" };
  }

  static async list() {
    const users = await UserService.getAllUsers();
    return { success: true, users: users.map((u) => ({ email: u.email })) };
  }

  static async logout() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  }
}
