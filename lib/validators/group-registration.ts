import { z } from "zod";
import { REGISTRATION_CATEGORIES } from "@/lib/registration-fees";

export const GROUP_MIN_DELEGATES = 10;
export const GROUP_MAX_DELEGATES = 100; // above this, submit a second group registration

const delegateSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  designation: z.string().min(2).max(200).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  photoKey: z.string().max(300).regex(/^delegate-photos\/\d{4}\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/, "Invalid photo reference"),
  photoName: z.string().min(1).max(300),
  affiliation: z.string().min(2).max(300).trim(),
  aptiMemberId: z.string().max(100).trim().optional(),
});

export const groupRazorpayOrderSchema = z.object({
  coordinatorName: z.string().min(2).max(200).trim(),
  coordinatorEmail: z.string().email().toLowerCase().trim(),
  coordinatorPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  coordinatorPhotoKey: z.string().max(300).regex(/^delegate-photos\/\d{4}\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/),
  coordinatorPhotoName: z.string().min(1).max(300),
  coordinatorAffiliation: z.string().min(2).max(300).trim(),
  coordinatorAptiMemberId: z.string().max(100).trim().optional(),
  institution: z.string().min(2).max(300).trim(),
  city: z.string().max(120).trim().optional(),
  state: z.string().max(120).trim().optional(),

  category: z.enum(REGISTRATION_CATEGORIES),
  delegates: z
    .array(delegateSchema)
    .min(GROUP_MIN_DELEGATES, `A group registration needs at least ${GROUP_MIN_DELEGATES} delegates`)
    .max(GROUP_MAX_DELEGATES, `A single group registration supports up to ${GROUP_MAX_DELEGATES} delegates — please split larger groups`),
});

export const groupRazorpayVerifySchema = z.object({
  groupRegistrationId: z.string().length(24),
  razorpay_payment_id: z.string().min(3).max(100),
  razorpay_order_id: z.string().min(3).max(100),
  razorpay_signature: z.string().length(64),
});

export const groupDecisionSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reviewNote: z.string().max(2000).optional(),
}).refine((d) => d.decision !== "rejected" || !!d.reviewNote?.trim(), {
  message: "A note is required when rejecting a group registration",
  path: ["reviewNote"],
});

export type GroupRazorpayOrderInput = z.infer<typeof groupRazorpayOrderSchema>;
export type GroupRazorpayVerifyInput = z.infer<typeof groupRazorpayVerifySchema>;
export type GroupDecisionInput = z.infer<typeof groupDecisionSchema>;
