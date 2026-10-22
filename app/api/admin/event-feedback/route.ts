import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole, authErrorResponse } from "@/lib/auth";
import EventFeedback from "@/models/EventFeedback";
import Registration from "@/models/Registration";
import { RATING_KEYS } from "@/lib/event-feedback-shared";

/** Every submission plus the headline numbers for the admin Event Feedback page. */
export async function GET() {
  try {
    await requireRole("super_admin");
    await connectDB();

    const [items, confirmedDelegates] = await Promise.all([
      EventFeedback.find({}).sort({ createdAt: -1 }).lean(),
      Registration.countDocuments({ status: "approved" }),
    ]);

    const sums = Object.fromEntries(RATING_KEYS.map((k) => [k, 0])) as Record<string, number>;
    const recommend = { yes: 0, maybe: 0, no: 0 };
    let certificateDownloads = 0;
    let certificateHolders = 0;
    for (const f of items) {
      for (const k of RATING_KEYS) sums[k] += f.ratings?.[k] ?? 0;
      recommend[f.wouldRecommend] += 1;
      certificateDownloads += f.certificateDownloads ?? 0;
      if ((f.certificateDownloads ?? 0) > 0) certificateHolders += 1;
    }
    const averages = Object.fromEntries(
      RATING_KEYS.map((k) => [
        k,
        items.length ? Math.round((sums[k] / items.length) * 100) / 100 : null,
      ]),
    );

    return NextResponse.json({
      summary: {
        submissions: items.length,
        confirmedDelegates,
        averages,
        recommend,
        certificateDownloads,
        certificateHolders,
      },
      items: items.map((f) => ({
        id: f._id.toString(),
        registrationCode: f.registrationCode,
        name: f.name,
        email: f.email,
        institution: f.institution,
        ratings: f.ratings,
        wouldRecommend: f.wouldRecommend,
        mostValuable: f.mostValuable,
        suggestions: f.suggestions,
        certificateDownloads: f.certificateDownloads ?? 0,
        lastCertificateAt: f.lastCertificateAt?.toISOString() ?? null,
        createdAt: f.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
