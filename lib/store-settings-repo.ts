import { getPrimaryColor, getStoreName } from "@/lib/env";
import type { StoreSettings } from "@/lib/types";

const globalForSettings = globalThis as unknown as {
  zapfoodStoreSettings?: StoreSettings;
};

function defaultSettings(): StoreSettings {
  return {
    storeName: getStoreName(),
    primaryColor: getPrimaryColor(),
    logoUrl: null,
    openTime: "09:00",
    closeTime: "22:00",
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
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
    openTime: input.openTime?.trim() || current.openTime,
    closeTime: input.closeTime?.trim() || current.closeTime,
  };
  globalForSettings.zapfoodStoreSettings = next;
  return next;
}
