import { z } from "zod";
import {
  REGISTRATION_CATEGORIES,
  NEW_APTI_MEMBERSHIP_CATEGORY,
} from "@/lib/registration-fees";
import {
  BLOOD_GROUPS,
  GENDERS,
  REGIONS,
  QUALIFICATIONS,
  NATIONALITIES,
} from "@/lib/apti-membership-application";

// Re-exported so existing call sites can keep importing it from here alongside
// APTI_MEMBER_CATEGORIES/membershipDetailsSchema; the fee module is its source of truth since
// GST calculation also needs to know this category (see calculateFeeBreakdown).
export { NEW_APTI_MEMBERSHIP_CATEGORY };

const CategoryEnum = z.enum(REGISTRATION_CATEGORIES);

// Categories that claim an existing APTI membership (as opposed to buying one, or not
// claiming one at all) — these require a verified Membership ID. Kept here (not in
// lib/registration-fees.ts) since it's specifically about identity verification, not pricing.
export const APTI_MEMBER_CATEGORIES = [
  "APTI Life Member",
  "APTI Annual Member",
] as const;

export const membershipDetailsSchema = z.object({
  bloodGroup: z.enum(BLOOD_GROUPS),
  gender: z.enum(GENDERS),
  dob: z.string().trim().min(1, "Date of birth is required"),

  college: z.string().min(2).max(300).trim(),
  professionalState: z.string().min(1).max(120).trim(),
  region: z.enum(REGIONS),
  qualification: z.enum(QUALIFICATIONS),
  teachingExperience: z.string().min(1).max(200).trim(),
  professionalExperience: z.string().min(1).max(200).trim(),
  nationality: z.enum(NATIONALITIES),
  professionalStatus: z.string().max(200).trim().optional(),
  reference: z.string().max(200).trim().optional(),

  // Uploaded via /api/upload before the order is created, same pattern as the delegate photo.
  institutionalLetterKey: z
    .string()
    .max(300)
    .regex(
      /^institutional-letters\/\d{4}\/[A-Za-z0-9_-]+\.(jpg|jpeg|png|webp)$/,
      "Invalid institutional letter reference",
    ),
  institutionalLetterName: z.string().min(1).max(300),

  officeAddress: z.string().min(2).max(300).trim(),
  officePincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  officeCity: z.string().min(1).max(120).trim(),
  officeState: z.string().min(1).max(120).trim(),
  officePhone: z.string().trim().min(6).max(20),
  officeFax: z.string().max(30).trim().optional(),
  officeEmail: z.string().email().toLowerCase().trim(),

  residenceAddress: z.string().min(2).max(300).trim(),
  residencePincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  residenceCity: z.string().min(1).max(120).trim(),
  residenceState: z.string().min(1).max(120).trim(),
  residencePhone: z.string().trim().min(6).max(20),
  residenceEmail: z.string().email().toLowerCase().trim(),
});

export type MembershipDetailsInput = z.infer<typeof membershipDetailsSchema>;

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
    membershipDetails: membershipDetailsSchema.optional(),

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
  )
  .refine(
    (data) =>
      data.category !== NEW_APTI_MEMBERSHIP_CATEGORY || !!data.membershipDetails,
    {
      message: "Membership details are required for this category",
      path: ["membershipDetails"],
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
