import { z } from "zod";

export const userCreateSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  name: z.string().min(2).max(200).trim(),
  role: z.enum(["super_admin", "reviewer", "registration_approver"]),
  expertise: z.array(z.string().min(1).max(80)).max(20).default([]),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  expertise: z.array(z.string().min(1).max(80)).max(20).optional(),
  isActive: z.boolean().optional(),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
