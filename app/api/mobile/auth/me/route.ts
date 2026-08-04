import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { requireStaff } from "@/lib/mobile/auth";
import { ok, fail, failFromError } from "@/lib/mobile/response";

export async function GET(request: NextRequest) {
  try {
    const session = await requireStaff(request);
    await connectDB();
    const user = await User.findById(session.uid).lean();
    if (!user) return fail("User not found", [], 404);

    return ok({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (err) {
    return failFromError(err, "/auth/me");
  }
}
