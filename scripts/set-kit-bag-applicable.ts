/**
 * Marks registrations as "kit bag not applicable" (kit bag fee not paid), so the staff mobile app
 * shows it on scan and the server rejects kit actions for them.
 *
 * Reads registration codes from a text file (one per line, or comma/space separated).
 * Dry run by default — pass --apply to write.
 *
 * Run:
 *   npx tsx scripts/set-kit-bag-applicable.ts scripts/data/kit-bag-not-applicable.txt
 *   npx tsx scripts/set-kit-bag-applicable.ts scripts/data/kit-bag-not-applicable.txt --apply
 *
 * Pass --restore with --apply to set kitBagApplicable back to true for the same codes.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "fs";
import path from "path";
import { connectDB } from "../lib/db";
import Registration from "../models/Registration";

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const restore = args.includes("--restore");
  const filePath = args.find((arg) => !arg.startsWith("--"));
  if (!filePath) {
    console.error("Usage: tsx scripts/set-kit-bag-applicable.ts <codes-file> [--apply] [--restore]");
    process.exit(1);
  }

  const codes = [
    ...new Set(
      fs
        .readFileSync(path.resolve(filePath), "utf8")
        .split(/[\s,]+/)
        .map((code) => code.trim())
        .filter(Boolean),
    ),
  ];
  const kitBagApplicable = restore;

  await connectDB();

  const matches = await Registration.find({ registrationCode: { $in: codes } })
    .select("registrationCode fullName status kitBagApplicable")
    .lean();
  const foundCodes = new Set(matches.map((m) => m.registrationCode));
  const missing = codes.filter((code) => !foundCodes.has(code));

  console.log(`Codes in file: ${codes.length}  matched: ${matches.length}  not found: ${missing.length}`);
  for (const m of matches) {
    console.log(
      `  ${m.registrationCode}  ${m.fullName}  [${m.status}]  kitBagApplicable: ${m.kitBagApplicable !== false} -> ${kitBagApplicable}`,
    );
  }
  if (missing.length) console.log(`Not found in DB: ${missing.join(", ")}`);

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to update.");
    process.exit(0);
  }

  const result = await Registration.updateMany(
    { registrationCode: { $in: [...foundCodes] } },
    { $set: { kitBagApplicable } },
  );
  console.log(`\nUpdated ${result.modifiedCount} registration(s) to kitBagApplicable=${kitBagApplicable}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
