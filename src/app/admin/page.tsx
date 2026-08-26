import { getSettings } from "@/lib/settings";
import { AdminApp } from "@/components/admin/admin-app";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const settings = await getSettings();
  return <AdminApp settings={settings} />;
}
