import { getAdminSession } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/products-repo";
import { NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if ((await getAdminSession())?.role !== "STORE_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
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
  const data: {
    name?: string;
    price?: number;
    image?: string | null;
    active?: boolean;
    promoActive?: boolean;
    promoPrice?: number | null;
  } = {};
  if ("name" in b) data.name = String(b.name).trim();
  if ("price" in b) data.price = Number(b.price);
  if ("image" in b) {
    const v = b.image;
    data.image =
      v === null || v === undefined || v === "" ? null : String(v);
  }
  if ("active" in b) data.active = Boolean(b.active);
  if ("promoActive" in b) data.promoActive = Boolean(b.promoActive);
  if ("promoPrice" in b) {
    const value = b.promoPrice;
    data.promoPrice =
      value === null || value === undefined || value === ""
        ? null
        : Number(value);
  }

  if (data.name !== undefined && !data.name) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }
  if (data.price !== undefined && (Number.isNaN(data.price) || data.price < 0)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 400 });
  }
  if (
    data.promoPrice !== undefined &&
    data.promoPrice !== null &&
    (Number.isNaN(data.promoPrice) || data.promoPrice < 0)
  ) {
    return NextResponse.json({ error: "Invalid promo price" }, { status: 400 });
  }
  if (data.promoActive === false) {
    data.promoPrice = null;
  }

  const product = await updateProduct(id, data);
  if (!product) {
    return NextResponse.json({ error: "Not found or database error" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if ((await getAdminSession())?.role !== "STORE_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const ok = await deleteProduct(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
