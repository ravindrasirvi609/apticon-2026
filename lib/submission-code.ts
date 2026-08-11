import { nanoid, customAlphabet } from "nanoid";

// Human-readable, no ambiguous chars
const gen = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export function generateSubmissionCode(): string {
  return `APT-2026-${gen()}`;
}

export function generateGroupRegistrationCode(): string {
  return `APT-GRP-2026-${gen()}`;
}

export { nanoid };
