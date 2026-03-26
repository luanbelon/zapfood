import { clearAdminCookie } from "@/lib/auth";
import { ADMIN_LOGIN_PATH } from "@/lib/admin-path";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await clearAdminCookie();
  return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
}
