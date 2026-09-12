/**
 * Field constants for the "APTI Life Membership + APTICON Registration" bundled option, mirroring
 * https://aptiindia.org/membership_form_general. Kept mongoose-free so it can be imported by
 * both the client form and the Zod validator, same pattern as lib/registration-fees.ts.
 */

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const GENDERS = ["Male", "Female", "TransGender"] as const;
export type Gender = (typeof GENDERS)[number];

export const REGIONS = [
  "Central",
  "Eastern",
  "Northern",
  "Southern",
  "Western",
] as const;
export type Region = (typeof REGIONS)[number];

export const QUALIFICATIONS = [
  "B.Pharm",
  "M.Pharm",
  "Ph.D",
  "Pharm.D",
  "Post Baccalaureate",
] as const;
export type Qualification = (typeof QUALIFICATIONS)[number];

export const NATIONALITIES = ["India", "Malaysia", "Turkey"] as const;
export type Nationality = (typeof NATIONALITIES)[number];
