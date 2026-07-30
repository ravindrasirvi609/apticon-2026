import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { getSessionFromCookies } from "@/lib/auth";
// GET — admin & approver list
export async function GET(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "super_admin" && s.role !== "registration_approver") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(url.searchParams.get("limit") ?? "25", 10));

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { fullName:          { $regex: safe, $options: "i" } },
      { registrationCode:  { $regex: safe, $options: "i" } },
      { email:             { $regex: safe, $options: "i" } },
      { transactionNumber: { $regex: safe, $options: "i" } },
      { institution:       { $regex: safe, $options: "i" } },
    ];
  }

  const [total, items] = await Promise.all([
    Registration.countDocuments(filter),
    Registration.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("registrationCode fullName email institution category feeAmount feeTier status createdAt linkedAbstract paymentMode transactionNumber")
      .lean(),
  ]);

  return NextResponse.json({ total, page, limit, items });
}
