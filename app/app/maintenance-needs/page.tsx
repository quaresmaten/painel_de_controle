import { DataModulePage } from "@/components/app/data-module-page";
import { getSessionUser } from "@/src/lib/auth";
import { moduleConfigs } from "@/src/lib/modules";

export const dynamic = "force-dynamic";

export default async function MaintenanceNeedsPage() {
  const user = await getSessionUser();
  return (
    <DataModulePage config={moduleConfigs["maintenance-needs"]} role={user?.role ?? "viewer"} />
  );
}
