import { z } from "zod";

export const aptiMemberCreateSchema = z.object({
  memberId: z.string().min(1, "Member ID is required").trim().transform((val) => val.toUpperCase()),
  serialNo: z.number().optional().nullable(),
  stateCode: z.string().trim().optional().nullable(),
  name: z.string().min(1, "Name is required").trim(),
  email: z
    .string()
    .trim()
    .transform((val) => val.toLowerCase())
    .pipe(z.string().email("Invalid email address").or(z.string().max(0)))
    .optional()
    .nullable(),
  mobile: z.string().trim().optional().nullable(),
  officeAddress: z.string().trim().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  pincode: z.string().trim().optional().nullable(),
});

export const aptiMemberUpdateSchema = aptiMemberCreateSchema.partial().omit({ memberId: true });

export const aptiMemberImportSchema = z.object({
  members: z.array(aptiMemberCreateSchema).min(1, "At least one member is required for import"),
});

export type AptiMemberCreateInput = z.infer<typeof aptiMemberCreateSchema>;
export type AptiMemberUpdateInput = z.infer<typeof aptiMemberUpdateSchema>;
export type AptiMemberImportInput = z.infer<typeof aptiMemberImportSchema>;
