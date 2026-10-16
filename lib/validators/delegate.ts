import { z } from "zod";

// registrationCode is the plain text encoded in the badge QR (AM1001, AA501, APT-REG-2026-XXXXXX).
export const delegateLoginSchema = z.object({
  registrationCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(3)
    .max(40)
    .regex(/^[A-Z0-9-]+$/),
  email: z.string().trim().toLowerCase().email().max(200),
});

export type DelegateLoginInput = z.infer<typeof delegateLoginSchema>;
