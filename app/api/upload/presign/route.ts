import { NextResponse, type NextRequest } from "next/server";
import {
  presignRequestSchema,
  PRESIGN_ABSTRACT_TYPES,
  PRESIGN_PAYMENT_TYPES,
} from "@/lib/validators/abstract";
import { buildAbstractKey, buildPaymentProofKey, presignUpload, publicUrl } from "@/lib/r2";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = presignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  // Enforce purpose ↔ content-type consistency
  const { purpose, contentType, fileName } = parsed.data;
  const allowed = purpose === "payment_proof" ? PRESIGN_PAYMENT_TYPES : PRESIGN_ABSTRACT_TYPES;
  if (!allowed.includes(contentType as never)) {
    return NextResponse.json({ error: `contentType ${contentType} is not allowed for ${purpose}` }, { status: 400 });
  }

  // Payment proofs are capped tighter (5 MB) than abstracts (10 MB, enforced by schema)
  if (purpose === "payment_proof" && parsed.data.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Payment proof must be 5 MB or less" }, { status: 400 });
  }

  try {
    const key = purpose === "payment_proof" ? buildPaymentProofKey(fileName) : buildAbstractKey(fileName);
    const uploadUrl = await presignUpload(key, contentType);
    return NextResponse.json({
      key,
      uploadUrl,
      publicUrl: publicUrl(key),
    });
  } catch (err) {
    console.error("[presign] failed:", err);
    return NextResponse.json({ error: "Failed to sign upload" }, { status: 500 });
  }
}
