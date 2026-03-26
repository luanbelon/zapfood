import { isAdminSession } from "@/lib/auth";
import { getSalesSummary } from "@/lib/customer-order-repo";
import { NextResponse } from "next/server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const summary = await getSalesSummary();
  return NextResponse.json(summary);
}
