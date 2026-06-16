import { redirect } from "next/navigation";

import { ApprovalsClient } from "@/components/app/approvals-client";
import { getSessionUser } from "@/src/lib/auth";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const user = await getSessionUser();

  if (user?.role !== "admin") redirect("/app");

  return <ApprovalsClient />;
}
