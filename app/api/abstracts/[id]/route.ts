import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import Review from "@/models/Review";
import User from "@/models/User";
import Registration from "@/models/Registration";
import { getSessionFromCookies } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id))
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const s = await getSessionFromCookies();
  if (!s) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const abs = await Abstract.findById(id).lean();
  if (!abs) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Reviewer only sees abstracts assigned to them
  if (s.role === "reviewer") {
    const isAssigned = abs.assignedReviewers.some(
      (r: mongoose.Types.ObjectId) => r.toString() === s.uid,
    );
    if (!isAssigned)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [reviews, reviewers] = await Promise.all([
    Review.find({ abstract: id }).populate("reviewer", "name email").lean(),
    User.find(
      { _id: { $in: abs.assignedReviewers } },
      "name email expertise",
    ).lean(),
  ]);

  // Reviewers cannot see private comments from other reviewers
  const scrubbedReviews =
    s.role === "reviewer"
      ? reviews.map((r) => {
          if (
            r.reviewer &&
            typeof r.reviewer === "object" &&
            "_id" in r.reviewer &&
            r.reviewer._id.toString() === s.uid
          ) {
            return r;
          }
          const { commentsPrivate: _hidden, ...rest } = r as {
            commentsPrivate?: string;
          };
          void _hidden;
          return rest;
        })
      : reviews;

  // Fetch linked registration (or lookup by email) — admin and editorial see the full row,
  // reviewer sees only a stub.
  const REG_FIELDS =
    "registrationCode fullName email status paymentStatus feeAmount feeTier createdAt approvedAt";
  let linkedRegistration: unknown = null;
  if (s.role !== "reviewer") {
    if (abs.linkedRegistration) {
      linkedRegistration = await Registration.findById(abs.linkedRegistration)
        .select(REG_FIELDS)
        .lean();
    } else {
      // Best-effort — is there a registration with the same email?
      linkedRegistration = await Registration.findOne({ email: abs.email })
        .select(REG_FIELDS)
        .lean();
    }
  } else if (abs.linkedRegistration) {
    // Reviewers only get an existence flag
    linkedRegistration = { present: true };
  }

  // Reviewers get a de-identified abstract — no author name, institution, or contact info.
  const responseAbstract =
    s.role === "reviewer"
      ? (() => {
          const {
            coAuthors: _coAuthors,
            presentingAuthor: _presentingAuthor,
            institution: _institution,
            email: _email,
            phone: _phone,
            ...rest
          } = abs;
          void _coAuthors;
          void _presentingAuthor;
          void _institution;
          void _email;
          void _phone;
          return rest;
        })()
      : abs;

  return NextResponse.json({
    abstract: responseAbstract,
    reviews: scrubbedReviews,
    reviewers,
    linkedRegistration,
  });
}
