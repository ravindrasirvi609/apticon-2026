import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { getAttendeeById } from "@/lib/mobile/search";
import { ok, fail, failFromError } from "@/lib/mobile/response";

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    await requireStaff(request);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id))
      return fail("Invalid attendee id", [], 400);

    const attendee = await getAttendeeById(id);
    if (!attendee) return fail("Attendee not found", [], 404);

    return ok(attendee);
  } catch (err) {
    return failFromError(err, "/attendees/[id]");
  }
}
