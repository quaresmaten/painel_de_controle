import { redirect } from "next/navigation";

import { LoginForm } from "@/components/app/login-form";
import { getSessionUser } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user?.status === "approved") redirect("/app");
  if (user) redirect("/pending");

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <LoginForm />
    </main>
  );
}
