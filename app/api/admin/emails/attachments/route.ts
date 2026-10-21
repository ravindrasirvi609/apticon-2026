import { NextResponse, type NextRequest } from "next/server";
import { requireRole, authErrorResponse } from "@/lib/auth";
import { buildEmailAttachmentKey, uploadBuffer } from "@/lib/r2";
import {
  EMAIL_ATTACHMENT_MAX_BYTES,
  EMAIL_ATTACHMENT_TYPES,
  attachmentExtension,
} from "@/lib/email-campaign-shared";

/** Upload one bulk-email attachment to R2. The compose form keeps the returned key. */
export async function POST(request: NextRequest) {
  try {
    await requireRole("super_admin");

    const formData = await request.formData().catch(() => null);
    const file = formData?.get("file");
    if (!(file instanceof File))
      return NextResponse.json({ error: "A file is required" }, { status: 400 });

    // The extension decides the stored content type — browsers often send an empty or wrong MIME.
    const ext = attachmentExtension(file.name);
    const contentType = EMAIL_ATTACHMENT_TYPES[ext];
    if (!contentType)
      return NextResponse.json(
        {
          error: `.${ext || "?"} files are not allowed. Allowed: ${Object.keys(EMAIL_ATTACHMENT_TYPES).join(", ")}`,
        },
        { status: 400 },
      );
    if (file.size === 0 || file.size > EMAIL_ATTACHMENT_MAX_BYTES)
      return NextResponse.json(
        {
          error: `Each file must be between 1 byte and ${EMAIL_ATTACHMENT_MAX_BYTES / 1024 / 1024} MB`,
        },
        { status: 400 },
      );

    const key = buildEmailAttachmentKey(ext);
    await uploadBuffer(key, Buffer.from(await file.arrayBuffer()), contentType);
    return NextResponse.json({
      key,
      filename: file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 150),
      size: file.size,
      contentType,
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
