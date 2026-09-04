import { z } from "zod";
import { REGISTRATION_CATEGORIES } from "@/lib/registration-fees";

const CategoryEnum = z.enum(REGISTRATION_CATEGORIES);

// Categories that claim an existing APTI membership (as opposed to buying one, or not
// claiming one at all) — these require a verified Membership ID. Kept here (not in
// lib/registration-fees.ts) since it's specifically about identity verification, not pricing.
export const APTI_MEMBER_CATEGORIES = [
  "APTI Life Member",
  "APTI Annual Member",
] as const;

// The only way a registration is created: Razorpay drives payment, so there are no
// manual payment-mode or payment-proof fields here.
export const razorpayOrderSchema = z
  .object({
    fullName: z.string().min(2).max(200).trim(),
    designation: z.string().min(2).max(200).trim(),
    institution: z.string().min(2).max(300).trim(),
    city: z.string().max(120).trim().optional(),
    state: z.string().max(120).trim().optional(),

    email: z.string().email().toLowerCase().trim(),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),

    category: CategoryEnum,
    willSubmitAbstract: z.boolean().default(false),
    aptiMemberId: z.string().trim().max(50).optional(),

    // Delegate photo — required, uploaded via /api/upload before the order is created. The key is
    // pinned to the photo prefix so a crafted request can't point photoUrl at some other object.
    photoKey: z
      .string()
      .max(300)
      .regex(
        /^delegate-photos\/\d{4}\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/,
        "Invalid photo reference",
      ),
    photoName: z.string().min(1).max(300),

    remarks: z.string().max(2000).optional(),
  })
  .refine(
    (data) =>
      !APTI_MEMBER_CATEGORIES.includes(
        data.category as (typeof APTI_MEMBER_CATEGORIES)[number],
      ) || (data.aptiMemberId?.length ?? 0) >= 3,
    {
      message: "APTI Membership ID is required for this category",
      path: ["aptiMemberId"],
    },
  );

export const razorpayVerifySchema = z.object({
  registrationId: z.string().length(24),
  razorpay_payment_id: z.string().min(3).max(100),
  razorpay_order_id: z.string().min(3).max(100),
  razorpay_signature: z.string().length(64),
});

export const registrationStatusLookupSchema = z.object({
  code: z.string().min(4).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const registrationNoteSchema = z.object({
  internalNote: z.string().max(2000),
});

export const registrationLinkSchema = z.object({
  abstractId: z.string().length(24).nullable(),
});

export const nudgeRequestSchema = z.object({
  emails: z.array(z.string().email().toLowerCase().trim()).min(1).max(200),
  kind: z.enum(["register", "abstract"]),
});

export type RazorpayOrderInput = z.infer<typeof razorpayOrderSchema>;
export type RegistrationStatusLookupInput = z.infer<
  typeof registrationStatusLookupSchema
>;
export type RegistrationNoteInput = z.infer<typeof registrationNoteSchema>;
export type RegistrationLinkInput = z.infer<typeof registrationLinkSchema>;
export type NudgeRequestInput = z.infer<typeof nudgeRequestSchema>;
