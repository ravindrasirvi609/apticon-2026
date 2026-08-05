import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import { abstractSubmitSchema } from "@/lib/validators/abstract";
import { generateSubmissionCode } from "@/lib/submission-code";
import { publicUrl } from "@/lib/r2";
import { sendMail, abstractSubmittedEmail } from "@/lib/email";
import { logAudit } from "@/lib/audit";
import { getSessionFromCookies } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/auth";
import { linkFromAbstract } from "@/lib/sync";

// POST /api/abstracts — public abstract submission
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`submit:${ip}`, 5, 60 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many submissions. Please retry in an hour." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = abstractSubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  await connectDB();

  // Regenerate on collision (astronomically unlikely, but cheap)
  let submissionCode = generateSubmissionCode();
  for (let i = 0; i < 5; i++) {
    const exists = await Abstract.exists({ submissionCode });
    if (!exists) break;
    submissionCode = generateSubmissionCode();
  }

  const created = await Abstract.create({
    submissionCode,
    title: data.title,
    authors: data.authors,
    presentingAuthor: data.presentingAuthor,
    institution: data.institution,
    email: data.email,
    phone: data.phone,
    theme: data.theme,
    type: data.type,
    abstract: data.abstract,
    keywords: data.keywords,
    fileKey: data.fileKey,
    fileName: data.fileName,
    fileUrl: data.fileKey ? publicUrl(data.fileKey) : undefined,
    status: "submitted",
  });

  // Sync with any existing registration for this email
  const linkResult = await linkFromAbstract(created._id, data.email, request);

  const { subject, html } = abstractSubmittedEmail(data.presentingAuthor, submissionCode, data.title);
  await sendMail({ to: data.email, subject, html });

  await logAudit({
    actorRole: "public",
    action: "abstract.submit",
    resourceType: "abstract",
    resourceId: created._id.toString(),
    details: { submissionCode, email: data.email, theme: data.theme, type: data.type, linkedRegistration: linkResult.registrationId ?? null },
    request,
  });

  return NextResponse.json({
    ok: true,
    submissionCode,
    id: created._id.toString(),
  });
}

// GET /api/abstracts — admin & reviewer list
export async function GET(request: NextRequest) {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      { title: { $regex: safe, $options: "i" } },
      { submissionCode: { $regex: safe, $options: "i" } },
      { email: { $regex: safe, $options: "i" } },
      { presentingAuthor: { $regex: safe, $options: "i" } },
    ];
  }
  if (s.role === "reviewer") {
    filter.assignedReviewers = s.uid;
  }

  const fields =
    s.role === "reviewer"
      ? "submissionCode title theme type status createdAt assignedReviewers"
      : "submissionCode title presentingAuthor email theme type status createdAt assignedReviewers";

  const [total, items] = await Promise.all([
    Abstract.countDocuments(filter),
    Abstract.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(fields)
      .lean(),
  ]);

  return NextResponse.json({ total, page, limit, items });
}
