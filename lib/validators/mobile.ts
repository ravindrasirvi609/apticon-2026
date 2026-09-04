import { z } from "zod";

export const mobileActionSchema = z.object({
  actionType: z.enum([
    "check_in",
    "id_card",
    "breakfast",
    "lunch",
    "dinner",
    "kit",
    "certificate",
  ]),
  day: z.number().int().min(1).max(30).optional(),
  device: z.string().max(200).optional(),
});

export type MobileActionInput = z.infer<typeof mobileActionSchema>;
