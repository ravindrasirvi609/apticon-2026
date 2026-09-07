/**
 * Imports the official APTI membership registry into MongoDB.
 * Source file is intentionally untracked (see .gitignore) — it contains real member PII.
 *
 * Run:
 *   npx tsx scripts/import-apti-members.ts [path-to-xlsx]
 *
 * Safe to re-run: upserts by Member ID, so an updated spreadsheet can be re-imported anytime.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import path from "path";
import * as xlsx from "xlsx";
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import AptiMember from "../models/AptiMember";

interface SheetRow {
  "Sl.no"?: number;
  "Member ID"?: string;
  "S.Code"?: string;
  Name?: string;
  Email?: string;
  Mobile?: string | number;
  "Off Address"?: string;
  City?: string;
  State?: string;
  Pincode?: string | number;
}

async function main() {
  const filePath =
    process.argv[2] ?? path.join(process.cwd(), "All APTI Data.xlsx");

  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<SheetRow>(sheet, { defval: "" });

  await connectDB();

  const byMemberId = new Map<string, SheetRow>();
  let blankId = 0;
  for (const row of rows) {
    const memberId = String(row["Member ID"] ?? "")
      .trim()
      .toUpperCase();
    if (!memberId) {
      blankId++;
      continue;
    }
    // Later rows win on duplicate Member IDs (source sheet has ~79 dupes).
    byMemberId.set(memberId, row);
  }

  const ops = Array.from(byMemberId.entries()).map(([memberId, row]) => ({
    updateOne: {
      filter: { memberId },
      update: {
        $set: {
          memberId,
          serialNo: row["Sl.no"] ? Number(row["Sl.no"]) : undefined,
          stateCode: String(row["S.Code"] ?? "").trim() || undefined,
          name: String(row["Name"] ?? "").trim(),
          email:
            String(row["Email"] ?? "")
              .trim()
              .toLowerCase() || undefined,
          mobile: String(row["Mobile"] ?? "").trim() || undefined,
          officeAddress: String(row["Off Address"] ?? "").trim() || undefined,
          city: String(row["City"] ?? "").trim() || undefined,
          state: String(row["State"] ?? "").trim() || undefined,
          pincode: String(row["Pincode"] ?? "").trim() || undefined,
        },
      },
      upsert: true,
    },
  }));

  const BATCH_SIZE = 1000;
  let written = 0;
  for (let i = 0; i < ops.length; i += BATCH_SIZE) {
    const batch = ops.slice(i, i + BATCH_SIZE);
    await AptiMember.bulkWrite(batch, { ordered: false });
    written += batch.length;
    console.log(`  ...${written}/${ops.length}`);
  }

  const noEmail = rows.filter((r) => !String(r["Email"] ?? "").trim()).length;
  console.log(
    `✓ Imported ${ops.length} unique members (${rows.length} rows in sheet, ${blankId} skipped with no Member ID, ${noEmail} with no email).`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
