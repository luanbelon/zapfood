import { getAdminSession } from "@/lib/auth";
import { getSalesSummary } from "@/lib/customer-order-repo";
import { NextResponse } from "next/server";

export async function GET() {
  if ((await getAdminSession())?.role !== "STORE_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await getSalesSummary();
  return NextResponse.json(summary);
}
