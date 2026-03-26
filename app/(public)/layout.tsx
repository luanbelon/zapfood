import { CartBar } from "@/components/CartBar";
import { HeaderClient } from "@/components/HeaderClient";
import { getWhatsAppNumber } from "@/lib/env";
import { getStoreSettings } from "@/lib/store-settings-repo";
import { isStoreOpenNow } from "@/lib/store-hours";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getStoreSettings();
  const storeOpen = isStoreOpenNow(settings.openTime, settings.closeTime);
  const wa = getWhatsAppNumber();

  return (
    <>
      <HeaderClient
        storeName={settings.storeName}
        primaryColor={settings.primaryColor}
        logoUrl={settings.logoUrl}
      />
      <main className="mx-auto w-full max-w-6xl px-3 pb-32 pt-4">{children}</main>
      <CartBar
        storeName={settings.storeName}
        whatsappNumber={wa}
        primaryColor={settings.primaryColor}
        isStoreOpen={storeOpen}
      />
    </>
  );
}
