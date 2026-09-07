import { NextResponse, type NextRequest } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { requireAnyRole, authErrorResponse, AuthError } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { syncRazorpayRegistration } from "@/lib/registration-payment";

/**
 * Re-reads a registration's payment state from Razorpay and applies it. This is the console's
 * only payment action — approval still comes from a gateway-confirmed capture, never from an
 * operator. Used when a webhook was missed or the delegate abandoned checkout.
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

    // Keep operators from hammering the gateway on one record.
    const limit = rateLimit(`razorpay-sync:${id}`, 10, 60_000);
    if (!limit.ok)
      return NextResponse.json(
        { error: "Too many sync attempts. Please wait a minute." },
        { status: 429 },
      );

    await connectDB();
    const reg = await Registration.findById(id);
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (reg.paymentMode !== "razorpay" || !reg.razorpayOrderId) {
      return NextResponse.json(
        { error: "This registration has no Razorpay order to sync." },
        { status: 400 },
      );
    }

    const result = await syncRazorpayRegistration(reg, request, {
      uid: s.uid,
      role: s.role,
    });
    const fresh = await Registration.findById(id)
      .select("status paymentStatus paymentError")
      .lean();

    return NextResponse.json({
      ok: true,
      outcome: result.outcome,
      status: fresh?.status,
      paymentStatus: fresh?.paymentStatus,
      paymentError: fresh?.paymentError ?? null,
    });
  } catch (err) {
    if (err instanceof AuthError) return authErrorResponse(err);
    console.error("[razorpay] payment sync failed:", err);
    return NextResponse.json(
      { error: "Could not reach Razorpay. Please try again shortly." },
      { status: 502 },
    );
  }
}
