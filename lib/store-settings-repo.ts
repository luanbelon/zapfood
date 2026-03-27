import { db } from "@/lib/db";
import { getPrimaryColor, getStoreName } from "@/lib/env";
import { isDatabaseEnabled } from "@/lib/env";
import { getCurrentStore } from "@/lib/tenant";
import type { StoreSettings } from "@/lib/types";

const globalForSettings = globalThis as unknown as {
  zapfoodStoreSettings?: StoreSettings;
};
type StoreConfigModel = {
  upsert: (args: {
    where: { storeId: string };
    create: {
      storeId: string;
      storeName: string;
      primaryColor: string;
      logoUrl: string | null;
      bannerImageUrl: string | null;
      openTime: string;
      closeTime: string;
    };
    update: Record<string, never>;
  }) => Promise<{
    storeName: string;
    primaryColor: string;
    logoUrl: string | null;
    bannerImageUrl: string | null;
    openTime: string;
    closeTime: string;
  }>;
  update: (args: {
    where: { storeId: string };
    data: {
      storeName: string;
      primaryColor: string;
      logoUrl: string | null;
      bannerImageUrl: string | null;
      openTime: string;
      closeTime: string;
    };
  }) => Promise<{
    storeName: string;
    primaryColor: string;
    logoUrl: string | null;
    bannerImageUrl: string | null;
    openTime: string;
    closeTime: string;
  }>;
};

function defaultSettings(): StoreSettings {
  return {
    storeName: getStoreName(),
    primaryColor: getPrimaryColor(),
    logoUrl: null,
    bannerImageUrl: null,
    openTime: "09:00",
    closeTime: "22:00",
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const store = await getCurrentStore();
  if (isDatabaseEnabled()) {
    try {
      const prismaAny = db as unknown as { storeConfig: StoreConfigModel };
      const config = await prismaAny.storeConfig.upsert({
        where: { storeId: store.id },
        create: {
          storeId: store.id,
          ...defaultSettings(),
        },
        update: {},
      });
      return config;
    } catch {
      // Falls back to in-memory settings when DB schema is not yet migrated.
    }
  }

  if (!globalForSettings.zapfoodStoreSettings) {
    globalForSettings.zapfoodStoreSettings = defaultSettings();
  } else {
    globalForSettings.zapfoodStoreSettings = {
      ...defaultSettings(),
      ...globalForSettings.zapfoodStoreSettings,
    };
  }
  return globalForSettings.zapfoodStoreSettings;
}

export async function updateStoreSettings(
  input: Partial<StoreSettings>,
): Promise<StoreSettings> {
  const store = await getCurrentStore();
  const current = await getStoreSettings();
  const next: StoreSettings = {
    storeName: input.storeName?.trim() || current.storeName,
    primaryColor: input.primaryColor?.trim() || current.primaryColor,
    logoUrl:
      input.logoUrl === undefined
        ? current.logoUrl
        : input.logoUrl?.trim()
          ? input.logoUrl.trim()
          : null,
    bannerImageUrl:
      input.bannerImageUrl === undefined
        ? current.bannerImageUrl
        : input.bannerImageUrl?.trim()
          ? input.bannerImageUrl.trim()
          : null,
    openTime: input.openTime?.trim() || current.openTime,
    closeTime: input.closeTime?.trim() || current.closeTime,
  };
  if (isDatabaseEnabled()) {
    try {
      const prismaAny = db as unknown as { storeConfig: StoreConfigModel };
      return await prismaAny.storeConfig.update({
        where: { storeId: store.id },
        data: next,
      });
    } catch {
      // Falls back to in-memory settings when DB schema is not yet migrated.
    }
  }

  globalForSettings.zapfoodStoreSettings = next;
  return next;
}
