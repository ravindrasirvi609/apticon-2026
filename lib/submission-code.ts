import { nanoid, customAlphabet } from "nanoid";

// Human-readable, no ambiguous chars
const gen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export function generateSubmissionCode(): string {
  return `APT-2026-${gen()}`;
}

export function generateRegistrationCode(): string {
  return `APT-REG-2026-${gen()}`;
}

export { nanoid };
