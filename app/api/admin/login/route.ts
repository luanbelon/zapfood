import { db } from "@/lib/db";
import { getAdminEmail, getMasterEmail, getMasterPassword, getStoreCode } from "@/lib/env";
import { setAdminCookie } from "@/lib/auth";
import { hashPassword } from "@/lib/crypto";
import { getCurrentStore } from "@/lib/tenant";
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
    mode?: unknown;
  };
  const password = String(payload.password ?? "");
  const email = String(payload.email ?? "").trim().toLowerCase();
  const storeCode = String(payload.storeCode ?? "").trim();

  const mode = String(payload.mode ?? "store");

  if (mode === "master") {
    if (email !== getMasterEmail().toLowerCase() || password !== getMasterPassword()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await setAdminCookie({ userId: "master-env", role: "MASTER", storeId: null });
    return NextResponse.json({ ok: true });
  }

  const store = await getCurrentStore();
  if (storeCode.toUpperCase() !== store.code.toUpperCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const prismaAny = db as unknown as {
    adminUser: {
      findFirst: (args: {
        where: { email: string; role: "STORE_ADMIN"; storeId: string };
      }) => Promise<{ id: string; passwordHash: string; storeId: string } | null>;
    };
  };

  const defaultPass = process.env.ADMIN_PASSWORD;
  const fallbackAllowed =
    email === getAdminEmail().toLowerCase() &&
    storeCode === getStoreCode() &&
    Boolean(defaultPass) &&
    password === defaultPass;

  let admin = await prismaAny.adminUser.findFirst({
    where: { email, role: "STORE_ADMIN", storeId: store.id },
  });

  if (!admin && fallbackAllowed) {
    const createAny = db as unknown as {
      adminUser: {
        create: (args: {
          data: { email: string; role: "STORE_ADMIN"; storeId: string; passwordHash: string };
        }) => Promise<{ id: string; passwordHash: string; storeId: string }>;
      };
    };
    admin = await createAny.adminUser.create({
      data: {
        email,
        role: "STORE_ADMIN",
        storeId: store.id,
        passwordHash: hashPassword(password),
      },
    });
  }

  if (!admin || admin.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await setAdminCookie({ userId: admin.id, role: "STORE_ADMIN", storeId: admin.storeId });
  return NextResponse.json({ ok: true });
}
