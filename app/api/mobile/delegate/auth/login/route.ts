import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import DelegateLoginAttempt from "@/models/DelegateLoginAttempt";
import { delegateLoginSchema } from "@/lib/validators/delegate";
import { getClientIp } from "@/lib/auth";
import { signDelegateSession } from "@/lib/mobile/delegate-auth";
import { logAudit } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";
import { ok, fail, failFromError } from "@/lib/mobile/response";

const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60_000;
const ATTEMPT_TTL_MS = 60 * 60_000;

async function recordFailure(key: string): Promise<void> {
  const attempt = await DelegateLoginAttempt.findOneAndUpdate(
    { key },
    {
      $inc: { failures: 1 },
      $set: { expiresAt: new Date(Date.now() + ATTEMPT_TTL_MS) },
    },
    { upsert: true, returnDocument: "after" },
  );
  if (attempt && attempt.failures >= MAX_FAILURES) {
    await DelegateLoginAttempt.updateOne(
      { key },
      { $set: { lockedUntil: new Date(Date.now() + LOCK_MS), failures: 0 } },
    );
  }
}

// QR + email login for delegates. The QR only contains the registrationCode, which is not a
// secret, so security rests on: DB-backed per-code lockout, a per-IP limiter, a generic failure
// message that never says which of code/email was wrong, and approved-only registrations.
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!rateLimit(`delegate-login:${ip}`, 30, 15 * 60_000).ok) {
      return fail("Too many attempts. Try again later.", [], 429);
    }

    const body = await request.json().catch(() => null);
    const parsed = delegateLoginSchema.safeParse(body);
    if (!parsed.success) return fail("Invalid details", [], 400);
    const { registrationCode, email } = parsed.data;

    await connectDB();

    const attempt = await DelegateLoginAttempt.findOne({
      key: registrationCode,
    }).lean();
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      return fail("Too many attempts. Try again later.", [], 429);
    }

    const registration = await Registration.findOne({ registrationCode }).select(
      "registrationCode email fullName institution status",
    );

    if (!registration || registration.email.toLowerCase() !== email) {
      await recordFailure(registrationCode);
      await logAudit({
        actorRole: "public",
        action: "mobile.delegate.login.failed",
        resourceType: "auth",
        details: { registrationCode },
        request,
      });
      return fail("Invalid details", [], 401);
    }

    // Code and email both matched, so the caller already knows both — safe to say why.
    if (registration.status !== "approved") {
      return fail(
        "Your registration is not approved yet. Please try again once it is confirmed.",
        [],
        403,
      );
    }

    await DelegateLoginAttempt.deleteOne({ key: registrationCode });

    const token = await signDelegateSession({
      rid: registration._id.toString(),
      registrationCode: registration.registrationCode,
      name: registration.fullName,
    });

    await logAudit({
      actorRole: "public",
      action: "mobile.delegate.login",
      resourceType: "registration",
      resourceId: registration._id.toString(),
      request,
    });

    return ok({
      token,
      delegate: {
        id: registration._id.toString(),
        name: registration.fullName,
        registrationCode: registration.registrationCode,
        institution: registration.institution,
      },
    });
  } catch (err) {
    return failFromError(err, "/delegate/auth/login");
  }
}
