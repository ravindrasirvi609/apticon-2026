import { NextResponse } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { getDashboardStats } from "@/lib/mobile/stats";

export async function GET() {
  try {
    await requireRole("super_admin");
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (err) {
    return authErrorResponse(err);
  }
}
