import mongoose from "mongoose";
import type { NextRequest } from "next/server";
import { requireStaff } from "@/lib/mobile/auth";
import { getActionHistory } from "@/lib/mobile/actions";
import { ok, fail, failFromError } from "@/lib/mobile/response";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireStaff(request);
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) return fail("Invalid attendee id", [], 400);

    const history = await getActionHistory(id);
    return ok({ history });
  } catch (err) {
    return failFromError(err, "/attendees/[id]/history");
  }
}
