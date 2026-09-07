import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { performAction, MobileActionError } from "@/lib/mobile/actions";
import { mobileActionSchema } from "@/lib/validators/mobile";
import { ok, fail, failFromError } from "@/lib/mobile/response";

// Single endpoint for every attendee action (check-in, ID card, breakfast/lunch/dinner, kit,
// certificate) — the "record an action" rule (validate -> write -> reject duplicates -> audit)
// is identical across all seven, so one route + one service function replaces seven near-copies.
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireStaff(request);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return fail("Invalid attendee id", [], 400);

    const body = await request.json().catch(() => null);
    const parsed = mobileActionSchema.safeParse(body);
    if (!parsed.success)
      return fail("Invalid input", parsed.error.flatten().formErrors, 400);

    const status = await performAction({
      registrationId: id,
      actionType: parsed.data.actionType,
      day: parsed.data.day,
      device: parsed.data.device,
      staffId: session.uid,
      staffRole: session.role,
      request,
    });

    return ok({ status }, "Action recorded");
  } catch (err) {
    if (err instanceof MobileActionError)
      return fail(err.message, [], err.status);
    return failFromError(err, "/attendees/[id]/actions");
  }
}
