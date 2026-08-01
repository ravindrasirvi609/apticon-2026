import type { NextRequest } from "next/server";
import AuditLog from "@/models/AuditLog";
import { connectDB } from "@/lib/db";
import { getClientIp } from "@/lib/auth";

interface AuditInput {
  actor?: string | null;
  actorRole: "super_admin" | "reviewer" | "editorial" | "public" | "system";
  action: string;
  resourceType: "user" | "abstract" | "review" | "auth" | "registration";
  resourceId?: string | null;
  details?: unknown;
  request?: NextRequest | Request;
}

export async function logAudit(input: AuditInput): Promise<void> {
  try {
    await connectDB();
    await AuditLog.create({
      actor: input.actor ?? null,
      actorRole: input.actorRole,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId ?? null,
      details: input.details ?? null,
      ip: input.request ? getClientIp(input.request) : "unknown",
      userAgent: input.request?.headers.get("user-agent") ?? "unknown",
    });
  } catch (err) {
    console.error("[audit] failed to log:", err);
  }
}
