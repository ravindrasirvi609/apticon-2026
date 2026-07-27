import { NextResponse, type NextRequest } from "next/server";
import {
  uploadRequestSchema,
  UPLOAD_ABSTRACT_TYPES,
  UPLOAD_PAYMENT_TYPES,
} from "@/lib/validators/abstract";
import { buildAbstractKey, buildPaymentProofKey, uploadBuffer } from "@/lib/r2";

const MAX_ABSTRACT_SIZE = 10 * 1024 * 1024;
const MAX_PAYMENT_PROOF_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid upload form" }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse({ purpose: formData.get("purpose") });
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File)) {
    return NextResponse.json({ error: "A file and valid upload purpose are required" }, { status: 400 });
  }

  const { purpose } = parsed.data;
  const allowedTypes = purpose === "payment_proof" ? UPLOAD_PAYMENT_TYPES : UPLOAD_ABSTRACT_TYPES;
  const maxSize = purpose === "payment_proof" ? MAX_PAYMENT_PROOF_SIZE : MAX_ABSTRACT_SIZE;

  if (!allowedTypes.includes(file.type as never)) {
    return NextResponse.json({ error: `File type ${file.type || "unknown"} is not allowed` }, { status: 400 });
  }
  if (file.size === 0 || file.size > maxSize) {
    return NextResponse.json({ error: `File must be ${maxSize / 1024 / 1024} MB or smaller` }, { status: 400 });
  }

  try {
    const key = purpose === "payment_proof" ? buildPaymentProofKey(file.name) : buildAbstractKey(file.name);
    await uploadBuffer(key, Buffer.from(await file.arrayBuffer()), file.type);
    return NextResponse.json({ key });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
