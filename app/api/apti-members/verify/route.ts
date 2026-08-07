import { NextResponse, type NextRequest } from "next/server";
import { verifyAptiMember } from "@/lib/apti-membership";
import { getClientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// GET /api/apti-members/verify?memberId=... — public, inline-form feedback only.
// Never returns email/phone/address: the response is a plain valid/name pair so this
// endpoint can't be used to scrape the registry.
export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = rateLimit(`apti-verify:${ip}`, 30, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many checks. Please wait a moment." }, { status: 429 });
  }

  const memberId = new URL(request.url).searchParams.get("memberId")?.trim() ?? "";
  if (memberId.length < 3) {
    return NextResponse.json({ valid: false });
  }

  const result = await verifyAptiMember(memberId);
  return NextResponse.json({ valid: result.valid, name: result.member?.name });
}
