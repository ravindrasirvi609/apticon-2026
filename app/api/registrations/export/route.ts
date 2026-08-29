import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import Registration from "@/models/Registration";
import { csvResponse, excelResponse } from "@/lib/export";

const headers = ["Registration Code", "Name", "Designation", "Institution", "Affiliation", "City", "State", "Email", "Phone", "Category", "Fee Tier", "Fee Amount", "Wants Abstract", "APTI Member ID", "Payment Mode", "Transaction Number", "Payment Status", "Razorpay Payment ID", "Status", "Abstract Linked", "Paid At", "Submitted At"];

export async function GET(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "super_admin" && session.role !== "editorial") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await connectDB();
  const url = new URL(request.url);
  const filter: Record<string, unknown> = {};
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const q = url.searchParams.get("q") ?? "";
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (q) {
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = ["fullName", "registrationCode", "email", "transactionNumber", "razorpayOrderId", "razorpayPaymentId", "institution"].map((field) => ({ [field]: { $regex: safe, $options: "i" } }));
  }
  const rows = await Registration.find(filter).sort({ createdAt: -1 }).lean();
  const data = rows.map((r) => [r.registrationCode, r.fullName, r.designation, r.institution, r.affiliation, r.city, r.state, r.email, r.phone, r.category, r.feeTier, r.feeAmount, r.willSubmitAbstract ? "Yes" : "No", r.aptiMemberId, r.paymentMode, r.transactionNumber, r.paymentStatus, r.razorpayPaymentId, r.status, r.linkedAbstract ? "Yes" : "No", r.paidAt, r.createdAt]);
  const format = url.searchParams.get("format") === "csv" ? "csv" : "xlsx";
  const filename = `APTICON-2026-Registrations-${new Date().toISOString().slice(0, 10)}.${format}`;
  return format === "csv" ? csvResponse(filename, headers, data) : excelResponse(filename, "Registrations", headers, data);
}
