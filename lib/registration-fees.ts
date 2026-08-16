/**
 * Fee source of truth. Kept aligned with components/registration/FeeTable.tsx display.
 */

export type FeeTier = "early_bird" | "regular" | "on_spot";
export const GST_RATE = 0.18;

export const REGISTRATION_CATEGORIES = [
  "APTI Life Member",
  "APTI Annual Member",
  "Non-Member",
  "PG Student / Research Scholar",
  "UG Student",
  "Accompanying Person",
  "APTI Membership + APTICON Registration",
] as const;

export type RegistrationCategory = (typeof REGISTRATION_CATEGORIES)[number];

// INR
export const FEE_TABLE: Record<RegistrationCategory, Record<FeeTier, number>> = {
  "APTI Life Member":            { early_bird: 1, regular: 3500, on_spot: 4000 },
  "APTI Annual Member":          { early_bird: 1, regular: 4000, on_spot: 4500 },
  "Non-Member":                  { early_bird: 1, regular: 5500, on_spot: 6000 },
  "PG Student / Research Scholar": { early_bird: 1, regular: 3000, on_spot: 3500 },
  "UG Student":                  { early_bird: 1, regular: 2500, on_spot: 3000 },
  "Accompanying Person":         { early_bird: 1, regular: 1500, on_spot: 2000 },
  // TODO: confirm final pricing — placeholder amount for now.
  "APTI Membership + APTICON Registration": { early_bird: 6000, regular: 6000, on_spot: 6000 },
};

// Same dates as the public FeeTable UI copy
const EARLY_BIRD_CUTOFF = new Date("2026-09-01T00:00:00+05:30"); // "Till 31 Aug" (inclusive of Aug)
const ON_SPOT_START     = new Date("2026-10-24T00:00:00+05:30"); // conference start

export function currentFeeTier(now: Date = new Date()): FeeTier {
  if (now < EARLY_BIRD_CUTOFF) return "early_bird";
  if (now < ON_SPOT_START)     return "regular";
  return "on_spot";
}

export function currentFeeAmount(category: RegistrationCategory, now: Date = new Date()): { tier: FeeTier; amount: number } {
  const tier = currentFeeTier(now);
  return { tier, amount: FEE_TABLE[category][tier] };
}

export function calculateFeeWithGst(baseAmount: number): { gstAmount: number; totalAmount: number } {
  const gstAmount = Math.round(baseAmount * GST_RATE);
  return { gstAmount, totalAmount: baseAmount + gstAmount };
}

export const GROUP_MIN_SIZE = 10;

/** Total headcount (paid + complimentary) at which the first free seat is granted. */
export const GROUP_COMPLIMENTARY_AT = GROUP_MIN_SIZE;

/** One complimentary seat for every ten delegates in the group. */
export function groupComplimentaryCount(delegateCount: number): number {
  return Math.floor(delegateCount / GROUP_MIN_SIZE);
}

export function currentGroupFeeAmount(category: RegistrationCategory, delegateCount: number, now: Date = new Date()) {
  const { tier, amount: perHead } = currentFeeAmount(category, now);
  const complimentaryCount = groupComplimentaryCount(delegateCount);
  const paidCount = delegateCount - complimentaryCount;
  return { tier, perHead, paidCount, complimentaryCount, baseAmount: perHead * paidCount };
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
