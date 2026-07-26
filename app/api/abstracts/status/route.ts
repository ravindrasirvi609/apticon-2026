import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import { abstractStatusLookupSchema } from "@/lib/validators/abstract";

// Public — submitter looks up their own submission by code + email
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = abstractStatusLookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await connectDB();
  const abs = await Abstract.findOne({
    submissionCode: parsed.data.code.toUpperCase(),
    email: parsed.data.email,
  })
    .select("submissionCode title presentingAuthor status theme type createdAt finalDecision finalDecisionAt finalDecisionNote")
    .lean();

  if (!abs) {
    return NextResponse.json({ error: "No submission found with that code and email." }, { status: 404 });
  }

  return NextResponse.json({ abstract: abs });
}
