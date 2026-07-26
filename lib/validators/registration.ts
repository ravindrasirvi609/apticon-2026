import { z } from "zod";
import { REGISTRATION_CATEGORIES } from "@/lib/registration-fees";

const CategoryEnum = z.enum(REGISTRATION_CATEGORIES);

export const registrationSubmitSchema = z.object({
  fullName:    z.string().min(2).max(200).trim(),
  designation: z.string().min(2).max(200).trim(),
  institution: z.string().min(2).max(300).trim(),
  city:        z.string().max(120).trim().optional(),
  state:       z.string().max(120).trim().optional(),

  email:       z.string().email().toLowerCase().trim(),
  phone:       z.string().min(6).max(30).trim(),
  whatsapp:    z.string().max(30).trim().optional(),

  category:            CategoryEnum,
  willSubmitAbstract:  z.boolean().default(false),

  paymentMode:       z.enum(["neft_rtgs", "upi", "dd", "online"]),
  transactionNumber: z.string().min(3).max(80).trim(),

  paymentProofKey:   z.string().min(3),
  paymentProofName:  z.string().min(1).max(300),

  remarks: z.string().max(2000).optional(),
});

export const registrationStatusLookupSchema = z.object({
  code:  z.string().min(4).max(60).trim(),
  email: z.string().email().toLowerCase().trim(),
});

export const registrationApproveSchema = z.object({
  internalNote: z.string().max(2000).optional(),
});

export const registrationRejectSchema = z.object({
  reason:       z.string().min(4).max(2000),
  internalNote: z.string().max(2000).optional(),
});

export const registrationLinkSchema = z.object({
  abstractId: z.string().length(24).nullable(),
});

export const nudgeRequestSchema = z.object({
  emails: z.array(z.string().email().toLowerCase().trim()).min(1).max(200),
  kind:   z.enum(["register", "abstract"]),
});

export type RegistrationSubmitInput = z.infer<typeof registrationSubmitSchema>;
export type RegistrationStatusLookupInput = z.infer<typeof registrationStatusLookupSchema>;
export type RegistrationApproveInput = z.infer<typeof registrationApproveSchema>;
export type RegistrationRejectInput = z.infer<typeof registrationRejectSchema>;
export type RegistrationLinkInput = z.infer<typeof registrationLinkSchema>;
export type NudgeRequestInput = z.infer<typeof nudgeRequestSchema>;
