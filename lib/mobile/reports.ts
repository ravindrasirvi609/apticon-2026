import { connectDB } from "@/lib/db";
import MobileActionLog, { type MobileActionType } from "@/models/MobileActionLog";

export const REPORT_TYPE_MAP: Record<string, MobileActionType> = {
  "checked-in": "check_in",
  "id-card": "id_card",
  breakfast: "breakfast",
  lunch: "lunch",
  dinner: "dinner",
  kit: "kit",
  certificate: "certificate",
};

interface ReportOptions {
  day?: number;
  page?: number;
  limit?: number;
}

interface ReportRegistration {
  registrationCode: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
}

interface ReportStaff {
  name: string;
}

export async function getActionReport(actionType: MobileActionType, opts: ReportOptions) {
  await connectDB();
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 25));

  const filter: Record<string, unknown> = { actionType };
  if (opts.day) filter.day = opts.day;

  const [total, logs] = await Promise.all([
    MobileActionLog.countDocuments(filter),
    MobileActionLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate<{ registration: ReportRegistration | null }>("registration", "registrationCode fullName email phone institution")
      .populate<{ staff: ReportStaff }>("staff", "name")
      .lean(),
  ]);

  const items = logs.map((log) => ({
    // A registration may have been removed after the action was recorded.
    // Mongoose returns null for an unresolvable populated reference.
    registration: log.registration ?? null,
    day: log.day,
    device: log.device,
    at: log.createdAt,
    by: log.staff?.name ?? "Unknown staff",
  }));

  return { total, page, limit, items };
}
