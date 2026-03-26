import { findCustomerByPhone } from "@/lib/customer-order-repo";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get("phone") ?? "";
  if (!phone) return NextResponse.json({ customer: null });
  const customer = await findCustomerByPhone(phone);
  return NextResponse.json({ customer });
}
