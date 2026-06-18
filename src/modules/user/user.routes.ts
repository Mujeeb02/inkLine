"use server";

import { redirect } from "next/navigation";
import { UserController } from "./user.controller";

export async function signUpAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = formData.get("nextPath") as string;

  const result = await UserController.signUp(email, password, nextPath);

  if (!result.success) {
    const errorMsg = encodeURIComponent(result.error ?? "unknown-error");
    redirect(`/login?error=${errorMsg}`);
  }

  redirect(result.nextPath || "/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nextPath = formData.get("nextPath") as string;

  const result = await UserController.login(email, password, nextPath);

  if (!result.success) {
    const errorMsg = encodeURIComponent(result.error ?? "unknown-error");
    redirect(`/login?error=${errorMsg}`);
  }

  redirect(result.nextPath || "/dashboard");
}

export async function quickLoginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const nextPath = formData.get("nextPath") as string;

  const result = await UserController.quickLogin(email, nextPath);

  if (!result.success) {
    redirect(`/login?error=${result.error}`);
  }

  redirect(result.nextPath || "/dashboard");
}

export async function logoutAction() {
  await UserController.logout();
  redirect("/login");
}
