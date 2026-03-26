import { getAdminEmail, getStoreCode } from "@/lib/env";
import { setAdminCookie } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = (typeof body === "object" && body !== null ? body : {}) as {
    password?: unknown;
    email?: unknown;
    storeCode?: unknown;
  };
  const password = String(payload.password ?? "");
  const email = String(payload.email ?? "").trim().toLowerCase();
  const storeCode = String(payload.storeCode ?? "").trim();

  const expected = process.env.ADMIN_PASSWORD;
  if (
    !expected ||
    password !== expected ||
    email !== getAdminEmail().toLowerCase() ||
    storeCode !== getStoreCode()
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
