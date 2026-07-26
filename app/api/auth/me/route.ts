import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({ user: s });
}
