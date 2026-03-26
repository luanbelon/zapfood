import { upsertCustomerAndOrder } from "@/lib/customer-order-repo";
import { buildWhatsAppUrl, formatOrderMessage } from "@/lib/whatsapp";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
  const storeName = String(b.storeName ?? "").trim();
  const whatsappNumber = String(b.whatsappNumber ?? "").trim();
  const phone = String(b.phone ?? "").trim();
  const customerName = String(b.customerName ?? "").trim();
  const address = String(b.address ?? "").trim();
  const lines = Array.isArray(b.lines) ? b.lines : [];

  if (!storeName || !whatsappNumber || !phone || !customerName || !address || lines.length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const normalizedLines = lines.map((raw) => {
    const l = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
    return {
      id: String(l.id ?? ""),
      name: String(l.name ?? ""),
      price: Number(l.price ?? 0),
      qty: Number(l.qty ?? 0),
    };
  });

  const total = normalizedLines.reduce((s, l) => s + l.price * l.qty, 0);
  const msg = formatOrderMessage(normalizedLines, {
    storeName,
    address,
    customerName,
    customerPhone: phone,
  });
  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, msg);

  await upsertCustomerAndOrder({
    phone,
    customerName,
    address,
    total,
    itemsJson: JSON.stringify(normalizedLines),
  });

  return NextResponse.json({ whatsappUrl });
}
