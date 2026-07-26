import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import AuditLog from "@/models/AuditLog";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole("super_admin");
    await connectDB();

    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const resourceType = url.searchParams.get("resourceType");
    const actorRole = url.searchParams.get("actorRole");
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(200, parseInt(url.searchParams.get("limit") ?? "50", 10));

    const filter: Record<string, unknown> = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (actorRole) filter.actorRole = actorRole;

    const [total, items] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("actor", "name email role")
        .lean(),
    ]);

    return NextResponse.json({ total, page, limit, items });
  } catch (err) {
    return authErrorResponse(err);
  }
}
