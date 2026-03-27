import { getAdminSession } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/products-repo";
import { NextResponse } from "next/server";

export async function GET() {
  const admin = (await getAdminSession())?.role === "STORE_ADMIN";
  try {
    const products = await listProducts(admin);
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if ((await getAdminSession())?.role !== "STORE_ADMIN") {
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
  const price = Number(b.price);
  const imageRaw = b.image;
  const image =
    imageRaw === null || imageRaw === undefined || imageRaw === ""
      ? null
      : String(imageRaw);
  const active = b.active !== false;
  const promoActive = Boolean(b.promoActive);
  const promoPriceRaw = b.promoPrice;
  const promoPrice =
    promoPriceRaw === null || promoPriceRaw === undefined || promoPriceRaw === ""
      ? null
      : Number(promoPriceRaw);

  if (!name || Number.isNaN(price) || price < 0) {
    return NextResponse.json({ error: "Invalid name or price" }, { status: 400 });
  }
  if (promoActive && (promoPrice === null || Number.isNaN(promoPrice) || promoPrice < 0)) {
    return NextResponse.json({ error: "Invalid promo price" }, { status: 400 });
  }

  try {
    const product = await createProduct({
      name,
      price,
      image,
      active,
      promoActive,
      promoPrice: promoActive ? promoPrice : null,
    });
    return NextResponse.json(product);
  } catch (e) {
    if (e instanceof Error && e.message === "PRODUCT_LIMIT_REACHED") {
      return NextResponse.json({ error: "Store product limit reached (120)" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
