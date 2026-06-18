import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE_NAME } from "@/modules/shared/constants";
import { UserService } from "@/modules/user/user.service";

export type PersistedUser = {
  _id: string;
  email: string;
};

export async function getCurrentUser(): Promise<PersistedUser | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!email) {
    return null;
  }

  await UserService.ensureSeedUsers();
  const user = await UserService.getUserByEmail(email);

  if (!user) {
    return null;
  }

  return {
    _id: user._id.toString(),
    email: user.email,
  };
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?._id ?? null;
}

export async function requireUser(): Promise<PersistedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
