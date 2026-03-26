import { isAdminSession } from "@/lib/auth";
import { getStoreSettings, updateStoreSettings } from "@/lib/store-settings-repo";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await getStoreSettings());
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const next = await updateStoreSettings({
    storeName: typeof b.storeName === "string" ? b.storeName : undefined,
    primaryColor: typeof b.primaryColor === "string" ? b.primaryColor : undefined,
    logoUrl: typeof b.logoUrl === "string" ? b.logoUrl : undefined,
    openTime: typeof b.openTime === "string" ? b.openTime : undefined,
    closeTime: typeof b.closeTime === "string" ? b.closeTime : undefined,
  });
  return NextResponse.json(next);
}
