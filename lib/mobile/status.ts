import { connectDB } from "@/lib/db";
import MobileActionLog, { type MobileActionType } from "@/models/MobileActionLog";

interface ActionRecord {
  at: Date;
  by: string;
}

export interface AttendeeStatusSnapshot {
  checkIn: ActionRecord | null;
  idCard: ActionRecord | null;
  kit: ActionRecord | null;
  certificate: ActionRecord | null;
  breakfast: Array<ActionRecord & { day: number }>;
  lunch: Array<ActionRecord & { day: number }>;
  dinner: Array<ActionRecord & { day: number }>;
}

type SingleActionKey = "checkIn" | "idCard" | "kit" | "certificate";

const SINGLE_ACTIONS: Record<string, SingleActionKey> = {
  check_in: "checkIn",
  id_card: "idCard",
  kit: "kit",
  certificate: "certificate",
};

// Builds the attendee's current status from their full action history. Used by the profile
// endpoint (Module 3), the history endpoint, and the actions endpoint's response (Module 4) so
// all three read the same authoritative shape instead of each re-deriving it.
export async function getAttendeeStatus(registrationId: string): Promise<AttendeeStatusSnapshot> {
  await connectDB();
  const actions = await MobileActionLog.find({ registration: registrationId })
    .populate<{ staff: { name: string } }>("staff", "name")
    .sort({ createdAt: 1 })
    .lean();

  const snapshot: AttendeeStatusSnapshot = {
    checkIn: null,
    idCard: null,
    kit: null,
    certificate: null,
    breakfast: [],
    lunch: [],
    dinner: [],
  };

  for (const action of actions) {
    const record = { at: action.createdAt, by: action.staff?.name ?? "Unknown staff" };
    const actionType = action.actionType as MobileActionType;
    if (actionType === "breakfast" || actionType === "lunch" || actionType === "dinner") {
      snapshot[actionType].push({ ...record, day: action.day });
    } else {
      const key = SINGLE_ACTIONS[actionType];
      if (key) snapshot[key] = record;
    }
  }

  return snapshot;
}
