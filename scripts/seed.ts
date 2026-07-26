/**
 * Seeds the initial super-admin from env vars.
 *
 *   SEED_ADMIN_EMAIL     — email of the admin to create
 *   SEED_ADMIN_PASSWORD  — password (min 8 chars)
 *   SEED_ADMIN_NAME      — display name
 *
 * Run:
 *   npx tsx scripts/seed.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db";
import User from "../models/User";
import { hashPassword } from "../lib/auth";
import mongoose from "mongoose";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    console.error("Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in .env.local");
    process.exit(1);
  }

  await connectDB();
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`✓ Super admin already exists: ${existing.email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await hashPassword(password);
  const created = await User.create({
    email: email.toLowerCase(),
    name,
    role: "super_admin",
    passwordHash,
    isActive: true,
    mustChangePassword: false,
  });

  console.log(`✓ Created super admin: ${created.email}`);
  console.log(`  You can now sign in at /admin/login`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
