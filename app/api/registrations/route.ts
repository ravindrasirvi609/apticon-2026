import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { getSessionFromCookies } from "@/lib/auth";
// GET — admin & approver list
export async function GET(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (s.role !== "super_admin" && s.role !== "editorial") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const url = new URL(request.url);
  const status = url.searchParams.get("status") ?? undefined;
  const paymentStatus = url.searchParams.get("paymentStatus") ?? undefined;
  const q = url.searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    100,
    parseInt(url.searchParams.get("limit") ?? "25", 10),
  );

  // Search/paymentStatus narrow the whole result set; `status` only narrows the rows we return,
  // so the status counts below stay accurate for every filter chip.
  const scope: Record<string, unknown> = {};
  if (paymentStatus) scope.paymentStatus = paymentStatus;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    scope.$or = [
      { fullName: { $regex: safe, $options: "i" } },
      { registrationCode: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
      { transactionNumber: { $regex: safe, $options: "i" } },
      { razorpayOrderId: { $regex: safe, $options: "i" } },
      { razorpayPaymentId: { $regex: safe, $options: "i" } },
      { institution: { $regex: safe, $options: "i" } },
    ];
  }
  const filter = status ? { ...scope, status } : scope;

  const [total, items, statusGroups] = await Promise.all([
    Registration.countDocuments(filter),
    Registration.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "registrationCode fullName email institution category feeAmount feeTier status createdAt linkedAbstract paymentMode transactionNumber paymentStatus razorpayOrderId razorpayPaymentId paymentError paidAt photoUrl",
      )
      .lean(),
    Registration.aggregate<{ _id: string; count: number }>([
      { $match: scope },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const counts: Record<string, number> = {};
  statusGroups.forEach((g) => (counts[g._id] = g.count));
  counts[""] = statusGroups.reduce((sum, g) => sum + g.count, 0);

  return NextResponse.json({ total, page, limit, items, counts });
}
