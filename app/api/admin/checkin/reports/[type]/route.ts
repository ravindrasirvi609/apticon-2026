import { NextResponse, type NextRequest } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { getActionReport, REPORT_TYPE_MAP } from "@/lib/mobile/reports";
import { DAY_SCOPED_ACTION_TYPES } from "@/models/MobileActionLog";

export async function GET(request: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  try {
    await requireRole("super_admin");
    const { type } = await ctx.params;
    const actionType = REPORT_TYPE_MAP[type];
    if (!actionType) return NextResponse.json({ error: "Unknown report type" }, { status: 400 });

    const url = new URL(request.url);
    const dayParam = url.searchParams.get("day");
    const day = dayParam ? Number(dayParam) : undefined;
    if (DAY_SCOPED_ACTION_TYPES.includes(actionType) && !day) {
      return NextResponse.json({ error: `A ?day= query parameter is required for the "${type}" report` }, { status: 400 });
    }

    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "25");

    const result = await getActionReport(actionType, { day, page, limit });
    return NextResponse.json(result);
  } catch (err) {
    return authErrorResponse(err);
  }
}
