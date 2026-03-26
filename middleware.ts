import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "zapfood_admin";
const ADMIN_BASE_PATH = "/painel-gestao-loja";
const ADMIN_LOGIN_PATH = "/painel-gestao-loja/acesso-seguro";

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
