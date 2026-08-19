import Counter from "@/models/Counter";
import type { RegistrationCategory } from "@/lib/registration-fees";

/** Every category maps to a badge-code prefix; Life and Annual members share "AM". */
const CATEGORY_PREFIX: Record<RegistrationCategory, string> = {
  "APTI Life Member": "AM",
  "APTI Annual Member": "AM",
  "Non-Member": "AN",
  "UG Student": "AU",
  "PG Student / Research Scholar": "AP",
  "Accompanying Person": "AA",
};

/** First number issued for each prefix. Accompanying persons run a lower/separate range. */
const PREFIX_START: Record<string, number> = {
  AM: 1001,
  AN: 1701,
  AU: 3001,
  AP: 2001,
  AA: 501,
};

/**
 * Sequential, category-prefixed registration code, e.g. "AM1001", "AA501". Each prefix has its
 * own Counter document so numbering per category starts from PREFIX_START and never collides
 * across categories.
 */
export async function generateRegistrationCode(category: RegistrationCategory): Promise<string> {
  const prefix = CATEGORY_PREFIX[category];
  const start = PREFIX_START[prefix];
  const key = `registration-code-${prefix}`;
  const doc = await Counter.findOneAndUpdate({ _id: key }, { $inc: { seq: 1 } }, { upsert: true, new: true }).lean();
  return `${prefix}${start + doc!.seq - 1}`;
}
