import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_COOKIE = "zapfood_admin";
const ADMIN_BASE_PATH = "/painel-gestao-loja";
const ADMIN_LOGIN_PATH = "/painel-gestao-loja/acesso-seguro";
const MASTER_BASE_PATH = "/painel-master";
const MASTER_LOGIN_PATH = "/painel-master/acesso";

type SessionLite = { role?: "MASTER" | "STORE_ADMIN" };

function parseSession(value?: string): SessionLite | null {
  if (!value) return null;
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as SessionLite;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === ADMIN_LOGIN_PATH) {
    return NextResponse.next();
  }
  if (pathname === MASTER_LOGIN_PATH) {
    return NextResponse.next();
  }
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    if (session?.role !== "STORE_ADMIN") {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
  }
  if (pathname.startsWith(MASTER_BASE_PATH)) {
    if (session?.role !== "MASTER") {
      return NextResponse.redirect(new URL(MASTER_LOGIN_PATH, request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/painel-gestao-loja/:path*", "/painel-master/:path*"],
};
