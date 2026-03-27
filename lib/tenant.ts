import { headers } from "next/headers";
import { db } from "@/lib/db";
import { isDatabaseEnabled } from "@/lib/env";

export type TenantStore = {
  id: string;
  name: string;
  code: string;
  subdomain: string;
  active: boolean;
};

const DEFAULT_DEV_SUBDOMAIN = "demo";

export async function getTenantSubdomain(): Promise<string> {
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").toLowerCase();
  if (!host) return DEFAULT_DEV_SUBDOMAIN;
  const clean = host.split(":")[0];
  if (clean === "localhost" || clean === "127.0.0.1") {
    return process.env.DEFAULT_STORE_SUBDOMAIN?.trim().toLowerCase() || DEFAULT_DEV_SUBDOMAIN;
  }
  const parts = clean.split(".");
  if (parts.length < 3) {
    return process.env.DEFAULT_STORE_SUBDOMAIN?.trim().toLowerCase() || DEFAULT_DEV_SUBDOMAIN;
  }
  return parts[0];
}

export async function getCurrentStore(): Promise<TenantStore> {
  const subdomain = await getTenantSubdomain();
  if (!isDatabaseEnabled()) {
    return {
      id: "store-demo",
      name: "Loja Demo",
      code: "DEMO01",
      subdomain,
      active: true,
    };
  }
  const prismaAny = db as unknown as {
    store: {
      findUnique: (args: { where: { subdomain: string } }) => Promise<TenantStore | null>;
    };
  };
  const store = await prismaAny.store.findUnique({ where: { subdomain } });
  if (!store) {
    throw new Error(`Store not found for subdomain: ${subdomain}`);
  }
  return store;
}
