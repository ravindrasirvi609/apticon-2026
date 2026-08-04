import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { userCreateSchema } from "@/lib/validators/user";
import { requireRole, requireAnyRole, hashPassword, generateTempPassword, authErrorResponse } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { sendMail, newUserWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    // Editorial needs this to populate the reviewer-assignment picker, but only ever sees active
    // reviewers — never admins, never account-state fields.
    const s = await requireAnyRole("super_admin", "editorial");
    const isAdmin = s.role === "super_admin";
    await connectDB();

    const url = new URL(request.url);
    const role = url.searchParams.get("role") ?? undefined;
    const filter: Record<string, unknown> = {};
    if (isAdmin) {
      if (role === "super_admin" || role === "reviewer" || role === "checkin_staff") filter.role = role;
    } else {
      filter.role = "reviewer";
      filter.isActive = true;
    }

    const users = await User.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        email: u.email,
        name: u.name,
        role: u.role,
        expertise: u.expertise ?? [],
        isActive: u.isActive,
        ...(isAdmin
          ? {
              mustChangePassword: u.mustChangePassword,
              lastLoginAt: u.lastLoginAt ?? null,
              createdAt: u.createdAt,
            }
          : {}),
      })),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole("super_admin");
    const body = await request.json().catch(() => null);
    const parsed = userCreateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });

    const tempPassword = generateTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const created = await User.create({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      expertise: parsed.data.expertise,
      passwordHash,
      mustChangePassword: true,
      createdBy: admin.uid,
    });

    await logAudit({
      actor: admin.uid,
      actorRole: "super_admin",
      action: "user.create",
      resourceType: "user",
      resourceId: created._id.toString(),
      details: { email: parsed.data.email, name: parsed.data.name, role: parsed.data.role },
      request,
    });

    const { subject, html } = newUserWelcomeEmail(parsed.data.name, parsed.data.email, tempPassword, parsed.data.role);
    await sendMail({ to: parsed.data.email, subject, html });

    return NextResponse.json({
      ok: true,
      id: created._id.toString(),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
