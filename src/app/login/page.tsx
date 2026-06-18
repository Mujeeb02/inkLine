import { redirect } from "next/navigation";

import { LoginCard } from "@/features/auth/components/LoginCard";
import { getCurrentUser } from "@/modules/shared/middleware/auth";
import { SEEDED_USERS } from "@/modules/shared/constants";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();
  const { next } = await searchParams;

  if (user) {
    redirect(next || "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <LoginCard nextPath={next} users={SEEDED_USERS} />
    </main>
  );
}
