import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { getAttendeeByCode } from "@/lib/mobile/search";
import { ok, fail, failFromError } from "@/lib/mobile/response";

// Direct target of a QR scan — the QR image encodes the attendee's registrationCode as-is,
// so the scanner hits this exact-match lookup instead of the fuzzy /attendees/search endpoint.
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  try {
    await requireStaff(request);
    const { code } = await ctx.params;
    if (!code) return fail("Registration code is required", [], 400);

    const attendee = await getAttendeeByCode(code);
    if (!attendee) return fail("Attendee not found", [], 404);

    return ok(attendee);
  } catch (err) {
    return failFromError(err, "/attendees/by-code/[code]");
  }
}
