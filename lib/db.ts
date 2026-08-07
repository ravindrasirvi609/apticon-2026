import mongoose from "mongoose";

// Side-effect imports: several queries populate() a ref (e.g. MobileActionLog.staff -> "User",
// reports.registration -> "Registration") from files that don't otherwise import that model.
// Mongoose only registers a schema once its model file is actually loaded, and Next.js/Vercel can
// bundle each API route as an isolated function — so a route that never imports models/User.ts
// throws MissingSchemaError the moment it populates "staff". Registering every model here,
// where every DB-touching code path already calls connectDB() first, closes that gap for good.
import "@/models/User";
import "@/models/Registration";
import "@/models/MobileActionLog";
import "@/models/AuditLog";
import "@/models/Abstract";
import "@/models/Review";
import "@/models/PasswordReset";
import "@/models/AptiMember";
import "@/models/GroupRegistration";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not defined in the environment");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI as string, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cache.conn = await cache.promise;
  } catch (err) {
    cache.promise = null;
    throw err;
  }

  return cache.conn;
}
