import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import MobileActionLog, { DAY_SCOPED_ACTION_TYPES, type MobileActionType } from "@/models/MobileActionLog";
import { logAudit } from "@/lib/audit";
import type { Role } from "@/lib/auth";
import { getAttendeeStatus, type AttendeeStatusSnapshot } from "@/lib/mobile/status";

export class MobileActionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const ACTION_LABELS: Record<MobileActionType, string> = {
  check_in: "Check-in",
  id_card: "ID card",
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  kit: "Kit",
  certificate: "Certificate",
};

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === 11000;
}

export interface PerformActionInput {
  registrationId: string;
  actionType: MobileActionType;
  day?: number;
  staffId: string;
  staffRole: Role;
  device?: string;
  request?: NextRequest | Request;
}

export async function performAction(input: PerformActionInput): Promise<AttendeeStatusSnapshot> {
  await connectDB();
  const { registrationId, actionType, staffId, staffRole, device, request } = input;

  const registration = await Registration.findById(registrationId).select("_id status").lean();
  if (!registration) throw new MobileActionError("Attendee not found", 404);
  if (registration.status !== "approved") {
    throw new MobileActionError(
      `This attendee's registration is not approved yet (status: ${registration.status}). Actions cannot be recorded until payment is confirmed.`,
      409
    );
  }

  const isDayScoped = DAY_SCOPED_ACTION_TYPES.includes(actionType);
  if (isDayScoped && (!input.day || input.day < 1)) {
    throw new MobileActionError(`${ACTION_LABELS[actionType]} requires a valid conference day`, 400);
  }
  if (!isDayScoped && input.day) {
    throw new MobileActionError(`${ACTION_LABELS[actionType]} is not tracked per day`, 400);
  }
  const day = isDayScoped ? (input.day as number) : 0;

  try {
    await MobileActionLog.create({
      registration: registrationId,
      actionType,
      day,
      staff: staffId,
      device: device ?? "",
    });
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const existing = await MobileActionLog.findOne({ registration: registrationId, actionType, day })
        .populate<{ staff: { name: string } }>("staff", "name")
        .lean();
      const when = existing ? new Date(existing.createdAt).toLocaleString() : "earlier";
      const by = existing?.staff?.name ?? "another staff member";
      throw new MobileActionError(
        `${ACTION_LABELS[actionType]} already recorded for this attendee (${when}, by ${by}).`,
        409
      );
    }
    throw err;
  }

  await logAudit({
    actor: staffId,
    actorRole: staffRole,
    action: `mobile.action.${actionType}`,
    resourceType: "registration",
    resourceId: registrationId,
    details: { actionType, day },
    request,
  });

  return getAttendeeStatus(registrationId);
}

export interface ActionHistoryEntry {
  actionType: MobileActionType;
  day: number;
  device: string;
  at: Date;
  by: string;
}

export async function getActionHistory(registrationId: string): Promise<ActionHistoryEntry[]> {
  await connectDB();
  const actions = await MobileActionLog.find({ registration: registrationId })
    .populate<{ staff: { name: string } }>("staff", "name")
    .sort({ createdAt: -1 })
    .lean();

  return actions.map((action) => ({
    actionType: action.actionType,
    day: action.day,
    device: action.device,
    at: action.createdAt,
    by: action.staff?.name ?? "Unknown staff",
  }));
}
