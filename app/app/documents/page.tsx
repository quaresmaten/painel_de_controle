import { DataModulePage } from "@/components/app/data-module-page";
import { getSessionUser } from "@/src/lib/auth";
import { moduleConfigs } from "@/src/lib/modules";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const user = await getSessionUser();
  return <DataModulePage config={moduleConfigs.documents} role={user?.role ?? "viewer"} />;
}
