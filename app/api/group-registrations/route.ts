import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import GroupRegistration from "@/models/GroupRegistration";
import { getSessionFromCookies } from "@/lib/auth";

// GET — admin & editorial list
export async function GET(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "super_admin" && s.role !== "editorial") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10));

  const scope: Record<string, unknown> = {};
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    scope.$or = [
      { coordinatorName:  { $regex: safe, $options: "i" } },
      { coordinatorEmail: { $regex: safe, $options: "i" } },
      { groupCode:        { $regex: safe, $options: "i" } },
      { institution:      { $regex: safe, $options: "i" } },
    ];
  }
  const filter = status ? { ...scope, status } : scope;

  const [total, items, statusGroups] = await Promise.all([
    GroupRegistration.countDocuments(filter),
    GroupRegistration.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("groupCode coordinatorName coordinatorEmail institution category delegateCount complimentaryCount feeAmount feeTier status paymentStatus createdAt")
      .lean(),
    GroupRegistration.aggregate<{ _id: string; count: number }>([
      { $match: scope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<string, number> = {};
  statusGroups.forEach((g) => (counts[g._id] = g.count));
  counts[""] = statusGroups.reduce((sum, g) => sum + g.count, 0);

  return NextResponse.json({ total, page, limit, items, counts });
}
