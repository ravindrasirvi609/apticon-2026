import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Abstract from "@/models/Abstract";
import Registration from "@/models/Registration";
import User from "@/models/User";
import Review from "@/models/Review";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function GET() {
  try {
    await requireRole("super_admin");
    await connectDB();

    const [byStatusAbs, byTheme, byStatusReg, byPaymentStatus, totalUsers, reviewersActive, editorialActive, totalReviews, recentAbs, recentReg] = await Promise.all([
      Abstract.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Abstract.aggregate([{ $group: { _id: "$theme", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Registration.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Registration.aggregate([{ $match: { paymentStatus: { $ne: null } } }, { $group: { _id: "$paymentStatus", count: { $sum: 1 } } }]),
      User.countDocuments({}),
      User.countDocuments({ role: "reviewer", isActive: true }),
      User.countDocuments({ role: "editorial", isActive: true }),
      Review.countDocuments({}),
      Abstract.find({}).sort({ createdAt: -1 }).limit(5).select("submissionCode title presentingAuthor status createdAt").lean(),
      Registration.find({}).sort({ createdAt: -1 }).limit(5).select("registrationCode fullName email status paymentStatus feeAmount createdAt").lean(),
    ]);

    const abstractStatusMap: Record<string, number> = {};
    byStatusAbs.forEach((s) => (abstractStatusMap[s._id] = s.count));

    const regStatusMap: Record<string, number> = {};
    byStatusReg.forEach((s) => (regStatusMap[s._id] = s.count));

    const paymentStatusMap: Record<string, number> = {};
    byPaymentStatus.forEach((s) => (paymentStatusMap[s._id] = s.count));

    const totalAbstracts = byStatusAbs.reduce((a, b) => a + b.count, 0);
    const totalRegistrations = byStatusReg.reduce((a, b) => a + b.count, 0);

    // Revenue = sum of feeAmount across approved registrations
    const revenueAgg = await Registration.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, total: { $sum: "$feeAmount" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    return NextResponse.json({
      totals: {
        abstracts: totalAbstracts,
        registrations: totalRegistrations,
        users: totalUsers,
        activeReviewers: reviewersActive,
        activeEditorial: editorialActive,
        reviews: totalReviews,
        revenue: totalRevenue,
      },
      abstractsByStatus: abstractStatusMap,
      registrationsByStatus: regStatusMap,
      paymentsByStatus: paymentStatusMap,
      byTheme: byTheme.map((t) => ({ theme: t._id, count: t.count })),
      recentAbstracts: recentAbs.map((r) => ({
        id: r._id.toString(),
        submissionCode: r.submissionCode,
        title: r.title,
        presentingAuthor: r.presentingAuthor,
        status: r.status,
        createdAt: r.createdAt,
      })),
      recentRegistrations: recentReg.map((r) => ({
        id: r._id.toString(),
        registrationCode: r.registrationCode,
        fullName: r.fullName,
        email: r.email,
        status: r.status,
        paymentStatus: r.paymentStatus ?? null,
        feeAmount: r.feeAmount,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    return authErrorResponse(err);
  }
}
