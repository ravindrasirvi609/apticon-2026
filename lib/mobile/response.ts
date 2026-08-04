import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function ok<T>(data: T, message = "Success", status = 200): NextResponse {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(message: string, errors: string[] = [], status = 400): NextResponse {
  return NextResponse.json({ success: false, message, errors }, { status });
}

// Turns a thrown AuthError (from requireStaff) or unexpected error into the mobile envelope,
// so route handlers can wrap their body in one try/catch instead of repeating this check.
export function failFromError(err: unknown, context: string): NextResponse {
  if (err instanceof AuthError) return fail(err.message, [], err.status);
  console.error(`[mobile${context}]`, err);
  return fail("Internal error", [], 500);
}
