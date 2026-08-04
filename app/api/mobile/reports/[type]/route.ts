import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { getActionReport, REPORT_TYPE_MAP } from "@/lib/mobile/reports";
import { DAY_SCOPED_ACTION_TYPES } from "@/models/MobileActionLog";
import { ok, fail, failFromError } from "@/lib/mobile/response";

// One dynamic route for all seven distribution reports (checked-in, id-card, breakfast, lunch,
// dinner, kit, certificate) instead of near-identical files per type.
export async function GET(request: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  try {
    await requireStaff(request);
    const { type } = await ctx.params;
    const actionType = REPORT_TYPE_MAP[type];
    if (!actionType) return fail("Unknown report type", [], 400);

    const url = new URL(request.url);
    const dayParam = url.searchParams.get("day");
    const day = dayParam ? Number(dayParam) : undefined;
    if (DAY_SCOPED_ACTION_TYPES.includes(actionType) && !day) {
      return fail(`A ?day= query parameter is required for the "${type}" report`, [], 400);
    }

    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "25");

    const result = await getActionReport(actionType, { day, page, limit });
    return ok(result);
  } catch (err) {
    return failFromError(err, "/reports/[type]");
  }
}
