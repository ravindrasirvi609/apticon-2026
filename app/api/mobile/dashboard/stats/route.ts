import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { getDashboardStats } from "@/lib/mobile/stats";
import { ok, failFromError } from "@/lib/mobile/response";

export async function GET(request: NextRequest) {
  try {
    await requireStaff(request);
    const stats = await getDashboardStats();
    return ok(stats);
  } catch (err) {
    return failFromError(err, "/dashboard/stats");
  }
}
