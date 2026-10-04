import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import WpdPost from "@/models/WpdPost";
import { requireRole, authErrorResponse } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole("super_admin");
    await connectDB();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") ?? "").trim();
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(10, Number(url.searchParams.get("limit") ?? "25") || 25));
    const filter = q ? { $or: [
      { name: { $regex: q, $options: "i" } },
      { designation: { $regex: q, $options: "i" } },
      { organization: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { mobile: { $regex: q, $options: "i" } },
    ] } : {};
    const [total, posts] = await Promise.all([
      WpdPost.countDocuments(filter),
      WpdPost.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ]);
    return NextResponse.json({ total, page, limit, posts: posts.map((post) => ({
      id: post._id.toString(), name: post.name, designation: post.designation,
      organization: post.organization, email: post.email, mobile: post.mobile,
      photoUrl: post.photoUrl, createdAt: post.createdAt.toISOString(),
    })) });
  } catch (err) {
    return authErrorResponse(err);
  }
}
