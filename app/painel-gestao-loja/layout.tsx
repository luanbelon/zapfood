import { AdminShell } from "@/components/admin/AdminShell";
import { getStoreSettings } from "@/lib/store-settings-repo";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  return (
    <AdminShell
      storeName={settings.storeName}
      primaryColor={settings.primaryColor}
      logoUrl={settings.logoUrl}
    >
      {children}
    </AdminShell>
  );
}
