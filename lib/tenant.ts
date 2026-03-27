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
      findFirst: (args: {
        where?: { subdomain?: string; active?: boolean };
        orderBy?: { createdAt: "asc" | "desc" };
      }) => Promise<TenantStore | null>;
    };
  };
  const byHost = await prismaAny.store.findUnique({ where: { subdomain } });
  if (byHost?.active) return byHost;

  const fallbackSubdomain =
    process.env.DEFAULT_STORE_SUBDOMAIN?.trim().toLowerCase() || DEFAULT_DEV_SUBDOMAIN;
  const byFallback = await prismaAny.store.findFirst({
    where: { subdomain: fallbackSubdomain, active: true },
  });
  if (byFallback) return byFallback;

  const firstActive = await prismaAny.store.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  if (firstActive) return firstActive;

  // For master routes or first-time setup, avoid crashing when no store exists yet.
  return {
    id: "store-bootstrap",
    name: "Loja Bootstrap",
    code: "BOOT01",
    subdomain: fallbackSubdomain,
    active: true,
  };
}
