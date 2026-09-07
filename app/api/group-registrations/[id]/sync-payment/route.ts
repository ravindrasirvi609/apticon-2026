import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import GroupRegistration from "@/models/GroupRegistration";
import { requireAnyRole, authErrorResponse, AuthError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { syncGroupRazorpayRegistration } from "@/lib/registration-payment";

/**
 * Re-reads a group registration's payment state from Razorpay and applies it. Also the retry
 * path if an earlier capture created some delegates' registrations but not all — safe to run
 * as many times as needed since it only ever processes delegates still missing a registration.
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const s = await requireAnyRole("super_admin", "editorial");

    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const limit = rateLimit(`razorpay-group-sync:${id}`, 10, 60_000);
    if (!limit.ok)
      return NextResponse.json(
        { error: "Too many sync attempts. Please wait a minute." },
        { status: 429 },
      );

    await connectDB();
    const group = await GroupRegistration.findById(id);
    if (!group)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (group.paymentMode !== "razorpay" || !group.razorpayOrderId) {
      return NextResponse.json(
        { error: "This group registration has no Razorpay order to sync." },
        { status: 400 },
      );
    }

    const result = await syncGroupRazorpayRegistration(group, request, {
      uid: s.uid,
      role: s.role,
    });
    const fresh = await GroupRegistration.findById(id)
      .select("status paymentStatus paymentError")
      .lean();

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      status: fresh?.status,
      paymentStatus: fresh?.paymentStatus,
      paymentError: fresh?.paymentError ?? null,
      delegatesProcessed: result.delegatesProcessed ?? 0,
    });
  } catch (err) {
    if (err instanceof AuthError) return authErrorResponse(err);
    console.error("[razorpay] group payment sync failed:", err);
    return NextResponse.json(
      { error: "Could not reach Razorpay. Please try again shortly." },
      { status: 502 },
    );
  }
}
