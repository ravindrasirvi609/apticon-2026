import mongoose, { Schema, Model } from "mongoose";

export interface IAuditLog {
  _id: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId | null;
  actorRole: "super_admin" | "reviewer" | "registration_approver" | "public" | "system";
  action: string;
  resourceType: "user" | "abstract" | "review" | "auth" | "registration";
  resourceId: mongoose.Types.ObjectId | null;
  details: unknown;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    actorRole: { type: String, enum: ["super_admin", "reviewer", "registration_approver", "public", "system"], required: true, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, enum: ["user", "abstract", "review", "auth", "registration"], required: true, index: true },
    resourceId: { type: Schema.Types.ObjectId, default: null },
    details: { type: Schema.Types.Mixed },
    ip: { type: String, default: "unknown" },
    userAgent: { type: String, default: "unknown" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> =
  (mongoose.models.AuditLog as Model<IAuditLog>) ?? mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
export default AuditLog;
