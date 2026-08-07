import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { registrationStatusLookupSchema } from "@/lib/validators/registration";
import { generateRegistrationQrDataUrl } from "@/lib/qrcode";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = registrationStatusLookupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  await connectDB();
  const reg = await Registration.findOne({
    registrationCode: parsed.data.code.toUpperCase(),
    email: parsed.data.email,
  })
    .select("registrationCode fullName email category feeAmount feeTier status createdAt approvedAt rejectedAt reviewNote linkedAbstract willSubmitAbstract photoUrl paymentStatus")
    .lean();

  if (!reg) {
    return NextResponse.json({ error: "No registration found with that code and email." }, { status: 404 });
  }

  let linkedAbstract: { submissionCode: string; title: string; status: string } | null = null;
  if (reg.linkedAbstract) {
    const abs = await Abstract.findById(reg.linkedAbstract)
      .select("submissionCode title status")
      .lean();
    if (abs) {
      linkedAbstract = { submissionCode: abs.submissionCode, title: abs.title, status: abs.status };
    }
  }

  const qrCode = await generateRegistrationQrDataUrl(reg.registrationCode);

  return NextResponse.json({ registration: { ...reg, qrCode }, linkedAbstract });
}
