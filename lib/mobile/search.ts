import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { getAttendeeStatus } from "@/lib/mobile/status";

const ATTENDEE_LIST_FIELDS =
  "registrationCode fullName email phone institution designation category feeTier status paymentStatus photoUrl createdAt";

export type SearchField = "all" | "registrationCode" | "email" | "phone" | "fullName";

export interface SearchAttendeesParams {
  q?: string;
  field?: SearchField;
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function searchAttendees(params: SearchAttendeesParams) {
  await connectDB();
  const { q, field = "all", status } = params;
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 25));
  const sort = params.sort ?? "-createdAt";

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (q) {
    const safe = escapeRegex(q);
    if (field === "all") {
      filter.$or = [
        { registrationCode: { $regex: safe, $options: "i" } },
        { fullName: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { phone: { $regex: safe, $options: "i" } },
      ];
    } else {
      filter[field] = { $regex: safe, $options: "i" };
    }
  }

  const [total, items] = await Promise.all([
    Registration.countDocuments(filter),
    Registration.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select(ATTENDEE_LIST_FIELDS)
      .lean(),
  ]);

  return { total, page, limit, items };
}

export async function getAttendeeById(id: string) {
  await connectDB();
  const registration = await Registration.findById(id).lean();
  if (!registration) return null;
  const status = await getAttendeeStatus(registration._id.toString());
  return { registration, status };
}

export async function getAttendeeByCode(code: string) {
  await connectDB();
  const registration = await Registration.findOne({ registrationCode: code }).lean();
  if (!registration) return null;
  const status = await getAttendeeStatus(registration._id.toString());
  return { registration, status };
}
