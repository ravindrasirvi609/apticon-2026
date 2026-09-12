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
  "APTI Life Membership + APTICON Registration",
] as const;

export type RegistrationCategory = (typeof REGISTRATION_CATEGORIES)[number];

// The ₹6995 for this category is already the final amount the registrant pays — GST is not
// added on top, unlike every other category.
export const NEW_APTI_MEMBERSHIP_CATEGORY =
  "APTI Life Membership + APTICON Registration" as const;

// INR
export const FEE_TABLE: Record<
  RegistrationCategory,
  Record<FeeTier, number>
> = {
  "APTI Life Member": { early_bird: 3000, regular: 3500, on_spot: 4000 },
  "APTI Annual Member": { early_bird: 3500, regular: 4000, on_spot: 4500 },
  "Non-Member": { early_bird: 5000, regular: 5500, on_spot: 6000 },
  "PG Student / Research Scholar": {
    early_bird: 2500,
    regular: 3000,
    on_spot: 3500,
  },
  "UG Student": { early_bird: 2000, regular: 2500, on_spot: 3000 },
  "Accompanying Person": { early_bird: 1000, regular: 1500, on_spot: 2000 },
  // Flat fee regardless of tier — bundles a new APTI Life membership application with registration.
  "APTI Life Membership + APTICON Registration": {
    early_bird: 6995,
    regular: 6995,
    on_spot: 6995,
  },
};

// Same dates as the public FeeTable UI copy
const EARLY_BIRD_CUTOFF = new Date("2026-09-16T00:00:00+05:30"); // "Till 15 Sep" (inclusive of Sep 15)
const ON_SPOT_START = new Date("2026-10-24T00:00:00+05:30"); // conference start

export function currentFeeTier(now: Date = new Date()): FeeTier {
  if (now < EARLY_BIRD_CUTOFF) return "early_bird";
  if (now < ON_SPOT_START) return "regular";
  return "on_spot";
}

export function currentFeeAmount(
  category: RegistrationCategory,
  now: Date = new Date(),
): { tier: FeeTier; amount: number } {
  const tier = currentFeeTier(now);
  return { tier, amount: FEE_TABLE[category][tier] };
}

export function calculateFeeWithGst(baseAmount: number): {
  gstAmount: number;
  totalAmount: number;
} {
  const gstAmount = Math.round(baseAmount * GST_RATE);
  return { gstAmount, totalAmount: baseAmount + gstAmount };
}

/**
 * Category-aware fee breakdown. Every category adds 18% GST on top of the base fee, except
 * "APTI Life Membership + APTICON Registration" — its ₹6995 is a flat, GST-inclusive total.
 */
export function calculateFeeBreakdown(
  category: RegistrationCategory,
  baseAmount: number,
): { gstAmount: number; totalAmount: number } {
  if (category === NEW_APTI_MEMBERSHIP_CATEGORY) {
    return { gstAmount: 0, totalAmount: baseAmount };
  }
  return calculateFeeWithGst(baseAmount);
}

export const GROUP_MIN_SIZE = 10;

/** Total headcount (10 paid + 1 complimentary) at which the first free seat is granted. */
export const GROUP_COMPLIMENTARY_AT = GROUP_MIN_SIZE + 1;

/** One complimentary seat for every ten paid delegates (11 total for the first free seat). */
export function groupComplimentaryCount(delegateCount: number): number {
  return Math.floor(delegateCount / GROUP_COMPLIMENTARY_AT);
}

export function currentGroupFeeAmount(
  category: RegistrationCategory,
  delegateCount: number,
  now: Date = new Date(),
) {
  const { tier, amount: perHead } = currentFeeAmount(category, now);
  const complimentaryCount = groupComplimentaryCount(delegateCount);
  const paidCount = delegateCount - complimentaryCount;
  return {
    tier,
    perHead,
    paidCount,
    complimentaryCount,
    baseAmount: perHead * paidCount,
  };
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
