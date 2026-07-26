import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { registrationSubmitSchema } from "@/lib/validators/registration";
import { generateRegistrationCode } from "@/lib/submission-code";
import { publicUrl } from "@/lib/r2";
import { currentFeeAmount } from "@/lib/registration-fees";
import { sendMail, registrationSubmittedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getSessionFromCookies, getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { linkFromRegistration } from "@/lib/sync";

const FEE_TIER_LABEL: Record<string, string> = {
  early_bird: "Early Bird (till 31 Aug 2026)",
  regular:    "Regular",
  on_spot:    "On-Spot",
};

// POST — public submission with payment proof
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`register:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many submissions. Please retry in an hour." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = registrationSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const { tier, amount } = currentFeeAmount(data.category);

  await connectDB();

  let registrationCode = generateRegistrationCode();
  for (let i = 0; i < 5; i++) {
    const exists = await Registration.exists({ registrationCode });
    if (!exists) break;
    registrationCode = generateRegistrationCode();
  }

  const created = await Registration.create({
    registrationCode,

    fullName:    data.fullName,
    designation: data.designation,
    institution: data.institution,
    city:        data.city,
    state:       data.state,

    email:    data.email,
    phone:    data.phone,
    whatsapp: data.whatsapp,

    category:           data.category,
    feeTier:            tier,
    feeAmount:          amount,
    willSubmitAbstract: data.willSubmitAbstract,

    paymentMode:       data.paymentMode,
    transactionNumber: data.transactionNumber,
    paymentProofKey:   data.paymentProofKey,
    paymentProofUrl:   publicUrl(data.paymentProofKey),
    paymentProofName:  data.paymentProofName,

    status: "payment_review",
    remarks: data.remarks,
  });

  // Sync — link to any existing abstract with the same email
  const linkResult = await linkFromRegistration(created._id, data.email, request);

  const { subject, html } = registrationSubmittedEmail(data.fullName, registrationCode, amount, FEE_TIER_LABEL[tier]);
  await sendMail({ to: data.email, subject, html });

  await logAudit({
    actorRole: "public",
    action: "registration.submit",
    resourceType: "registration",
    resourceId: created._id.toString(),
    details: {
      registrationCode,
      email: data.email,
      category: data.category,
      feeTier: tier,
      feeAmount: amount,
      paymentMode: data.paymentMode,
      linkedAbstract: linkResult.abstractId ?? null,
    },
    request,
  });

  return NextResponse.json({
    ok: true,
    registrationCode,
    id: created._id.toString(),
    feeAmount: amount,
    feeTier: tier,
  });
}

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
