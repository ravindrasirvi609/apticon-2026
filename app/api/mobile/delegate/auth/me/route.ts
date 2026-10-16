import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { requireDelegate } from "@/lib/mobile/delegate-auth";
import { ok, fail, failFromError } from "@/lib/mobile/response";

// Validates a stored delegate token on app launch. Re-reads the registration so a registration
// that was later rejected/refunded stops working even though its JWT is still unexpired.
export async function GET(request: NextRequest) {
  try {
    const session = await requireDelegate(request);

    await connectDB();
    const registration = await Registration.findById(session.rid).select(
      "registrationCode fullName institution status",
    );
    if (!registration || registration.status !== "approved") {
      return fail("Forbidden", [], 403);
    }

    return ok({
      delegate: {
        id: registration._id.toString(),
        name: registration.fullName,
        registrationCode: registration.registrationCode,
        institution: registration.institution,
      },
    });
  } catch (err) {
    return failFromError(err, "/delegate/auth/me");
  }
}
