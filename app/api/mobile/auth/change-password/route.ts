import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { changePasswordSchema } from "@/lib/validators/auth";
import { requireStaff } from "@/lib/mobile/auth";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { ok, fail, failFromError } from "@/lib/mobile/response";

export async function POST(request: NextRequest) {
  try {
    const session = await requireStaff(request);

    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success)
      return fail("Invalid input", parsed.error.flatten().formErrors, 400);

    await connectDB();
    const user = await User.findById(session.uid).select("+passwordHash");
    if (!user) return fail("User not found", [], 404);

    const passwordOk = await verifyPassword(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!passwordOk) return fail("Current password is incorrect", [], 401);

    user.passwordHash = await hashPassword(parsed.data.newPassword);
    user.mustChangePassword = false;
    await user.save();

    await logAudit({
      actor: user._id.toString(),
      actorRole: user.role,
      action: "mobile.user.password_change",
      resourceType: "user",
      resourceId: user._id.toString(),
      request,
    });

    return ok(null, "Password updated");
  } catch (err) {
    return failFromError(err, "/auth/change-password");
  }
}
