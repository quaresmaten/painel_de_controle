import { redirect } from "next/navigation";

import { getSessionUser } from "@/src/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");
  if (user.status !== "approved") redirect("/pending");

  redirect("/app");
}
