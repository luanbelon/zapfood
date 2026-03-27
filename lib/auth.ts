import { cookies } from "next/headers";
import type { TenantStore } from "@/lib/tenant";

const COOKIE = "zapfood_admin";

export type AdminSession = {
  userId: string;
  role: "MASTER" | "STORE_ADMIN";
  storeId: string | null;
};

function encodeSession(session: AdminSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeSession(raw: string): AdminSession | null {
  try {
    const value = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = JSON.parse(value) as AdminSession;
    if (!parsed?.userId || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  return decodeSession(raw);
}

export async function isAdminSession(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function setAdminCookie(session: AdminSession): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isMasterSession(): Promise<boolean> {
  const session = await getAdminSession();
  return session?.role === "MASTER";
}

export async function isStoreAdminSession(store: TenantStore): Promise<boolean> {
  const session = await getAdminSession();
  return session?.role === "STORE_ADMIN" && session.storeId === store.id;
}
