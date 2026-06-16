import { redirect } from "next/navigation";

import { Sidebar } from "@/components/app/sidebar";
import { getSessionUser } from "@/src/lib/auth";

export default async function ProtectedLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
