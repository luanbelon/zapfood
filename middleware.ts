import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_BASE_PATH, ADMIN_LOGIN_PATH } from "@/lib/admin-path";

const ADMIN_COOKIE = "zapfood_admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    if (request.cookies.get(ADMIN_COOKIE)?.value !== "1") {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/painel-gestao-loja/:path*"],
};
