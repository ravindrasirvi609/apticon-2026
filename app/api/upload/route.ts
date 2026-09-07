import { NextResponse, type NextRequest } from "next/server";
import { uploadRequestSchema, UPLOAD_RULES } from "@/lib/validators/upload";
import {
  buildAbstractKey,
  buildGraphicalAbstractKey,
  buildPhotoKey,
  uploadBuffer,
} from "@/lib/r2";
import { getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Public endpoint — cap it so it can't be used as free object storage. Raised from 20 to
  // accommodate group registration coordinators uploading one photo per delegate (up to
  // GROUP_MAX_DELEGATES) in a single sitting, from behind one shared IP (e.g. a campus network).
  const ip = getClientIp(request);
  const limit = rateLimit(`upload:${ip}`, 150, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many uploads. Please retry in an hour." },
      { status: 429 },
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid upload form" }, { status: 400 });
  }

  const parsed = uploadRequestSchema.safeParse({
    purpose: formData.get("purpose") ?? undefined,
  });
  const file = formData.get("file");
  if (!parsed.success || !(file instanceof File)) {
    return NextResponse.json(
      { error: "A file and valid upload purpose are required" },
      { status: 400 },
    );
  }

  const { purpose } = parsed.data;
  const rules = UPLOAD_RULES[purpose];

  if (!rules.types.includes(file.type)) {
    return NextResponse.json(
      { error: `Only ${rules.label} files are allowed` },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > rules.maxBytes) {
    return NextResponse.json(
      { error: `File must be ${rules.maxBytes / 1024 / 1024} MB or smaller` },
      { status: 400 },
    );
  }

  try {
    const key =
      purpose === "photo"
        ? buildPhotoKey(file.name)
        : purpose === "graphicalAbstract"
          ? buildGraphicalAbstractKey(file.name)
          : buildAbstractKey(file.name);
    const url = await uploadBuffer(
      key,
      Buffer.from(await file.arrayBuffer()),
      file.type,
    );
    return NextResponse.json({ key, url });
  } catch (error) {
    console.error("[upload] failed:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
