/**
 * Cross-links Registrations and Abstracts by email.
 *
 * Both directions call `linkByEmail(...)` after they create their record;
 * whichever side arrives second finds the counterpart and writes both
 * `linkedRegistration` and `linkedAbstract` in a single pass.
 */

import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import Abstract from "@/models/Abstract";
import { logAudit } from "@/lib/audit";
import type { NextRequest } from "next/server";

interface LinkResult {
  linked: boolean;
  registrationId?: string;
  abstractId?: string;
}

async function auditLink(
  registrationId: mongoose.Types.ObjectId,
  abstractId: mongoose.Types.ObjectId,
  origin: "registration_submit" | "abstract_submit" | "manual",
  actor: { uid: string; role: "super_admin" | "reviewer" | "editorial" } | null,
  request?: NextRequest | Request,
) {
  await logAudit({
    actor: actor?.uid ?? null,
    actorRole: actor?.role ?? "system",
    action: `registration.link.${origin}`,
    resourceType: "registration",
    resourceId: registrationId.toString(),
    details: { registrationId: registrationId.toString(), abstractId: abstractId.toString(), origin },
    request,
  });
}

/**
 * Called after a new Registration is created. If any Abstract with the same
 * (lowercased) email exists, link the most recent one both ways.
 */
export async function linkFromRegistration(
  registrationId: mongoose.Types.ObjectId,
  email: string,
  request?: NextRequest | Request,
): Promise<LinkResult> {
  await connectDB();
  const abstract = await Abstract.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
  if (!abstract) return { linked: false };

  await Registration.updateOne({ _id: registrationId }, { $set: { linkedAbstract: abstract._id } });
  await Abstract.updateOne({ _id: abstract._id }, { $set: { linkedRegistration: registrationId } });
  await auditLink(registrationId, abstract._id, "registration_submit", null, request);

  return { linked: true, registrationId: registrationId.toString(), abstractId: abstract._id.toString() };
}

/**
 * Called after a new Abstract is created. If any Registration with the same
 * (lowercased) email exists, link the most recent one both ways.
 */
export async function linkFromAbstract(
  abstractId: mongoose.Types.ObjectId,
  email: string,
  request?: NextRequest | Request,
): Promise<LinkResult> {
  await connectDB();
  const registration = await Registration.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });
  if (!registration) return { linked: false };

  await Abstract.updateOne({ _id: abstractId }, { $set: { linkedRegistration: registration._id } });
  await Registration.updateOne({ _id: registration._id }, { $set: { linkedAbstract: abstractId } });
  await auditLink(registration._id, abstractId, "abstract_submit", null, request);

  return { linked: true, registrationId: registration._id.toString(), abstractId: abstractId.toString() };
}

/**
 * Manual (admin) re-link. Pass `null` for abstractId to unlink.
 */
export async function manualLink(
  registrationId: string,
  abstractId: string | null,
  actor: { uid: string; role: "super_admin" | "reviewer" | "editorial" },
  request?: NextRequest | Request,
): Promise<LinkResult> {
  await connectDB();
  const reg = await Registration.findById(registrationId);
  if (!reg) throw new Error("Registration not found");

  // Clear the previous link (if any) on the abstract side
  if (reg.linkedAbstract) {
    await Abstract.updateOne({ _id: reg.linkedAbstract }, { $unset: { linkedRegistration: "" } });
  }

  if (abstractId === null) {
    await Registration.updateOne({ _id: reg._id }, { $unset: { linkedAbstract: "" } });
    await logAudit({
      actor: actor.uid,
      actorRole: actor.role,
      action: "registration.unlink.manual",
      resourceType: "registration",
      resourceId: reg._id.toString(),
      details: { registrationId: reg._id.toString() },
      request,
    });
    return { linked: false, registrationId: reg._id.toString() };
  }

  const abstract = await Abstract.findById(abstractId);
  if (!abstract) throw new Error("Abstract not found");

  await Registration.updateOne({ _id: reg._id }, { $set: { linkedAbstract: abstract._id } });
  await Abstract.updateOne({ _id: abstract._id }, { $set: { linkedRegistration: reg._id } });
  await auditLink(reg._id, abstract._id, "manual", actor, request);

  return { linked: true, registrationId: reg._id.toString(), abstractId: abstract._id.toString() };
}
