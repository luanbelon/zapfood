import { getAdminSession } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function sanitizeCode(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function sanitizeSubdomain(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
}

export async function GET() {
  const session = await getAdminSession();
  if (session?.role !== "MASTER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prismaAny = db as unknown as {
    store: {
      findMany: (args: { orderBy: { createdAt: "desc" } }) => Promise<unknown>;
    };
  };
  const stores = await prismaAny.store.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(stores);
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (session?.role !== "MASTER") {
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
  const name = String(b.name ?? "").trim();
  const subdomain = sanitizeSubdomain(String(b.subdomain ?? ""));
  const code = sanitizeCode(String(b.code ?? ""));
  const adminEmail = String(b.adminEmail ?? "").trim().toLowerCase();
  const adminPassword = String(b.adminPassword ?? "").trim();

  if (!name || !subdomain || code.length !== 6 || !adminEmail || !adminPassword) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  try {
    const prismaAny = db as unknown as {
      store: {
        create: (args: {
          data: {
            name: string;
            subdomain: string;
            code: string;
            admins: { create: { email: string; role: "STORE_ADMIN"; passwordHash: string } };
          };
        }) => Promise<unknown>;
      };
    };
    const created = await prismaAny.store.create({
      data: {
        name,
        subdomain,
        code,
        admins: {
          create: {
            email: adminEmail,
            role: "STORE_ADMIN",
            passwordHash: hashPassword(adminPassword),
          },
        },
      },
    });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Failed to create store" }, { status: 400 });
  }
}
