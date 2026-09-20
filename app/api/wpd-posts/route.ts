import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import WpdPost from "@/models/WpdPost";
import { buildWpdPostPhotoKey, uploadBuffer } from "@/lib/r2";

const detailsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  designation: z.string().trim().min(2).max(120),
  organization: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(160),
  mobile: z.string().trim().regex(/^[+\d][\d\s().-]{7,20}$/),
});

export async function POST(request: NextRequest) {
  const formData = await request.formData().catch(() => null);
  if (!formData) return NextResponse.json({ error: "Invalid form data" }, { status: 400 });

  const parsed = detailsSchema.safeParse({
    name: formData.get("name"),
    designation: formData.get("designation"),
    organization: formData.get("organization"),
    email: formData.get("email"),
    mobile: formData.get("mobile"),
  });
  const photo = formData.get("photo");
  if (!parsed.success || !(photo instanceof File)) {
    return NextResponse.json({ error: "Name, designation, organization, email, mobile and photo are required." }, { status: 400 });
  }
  if (!("image/jpeg" === photo.type || "image/png" === photo.type || "image/webp" === photo.type)) {
    return NextResponse.json({ error: "Photo must be JPG, PNG or WebP." }, { status: 400 });
  }
  if (photo.size === 0 || photo.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Photo must be 5 MB or smaller." }, { status: 400 });
  }

  try {
    const key = buildWpdPostPhotoKey(photo.name);
    const photoUrl = await uploadBuffer(key, Buffer.from(await photo.arrayBuffer()), photo.type);
    await connectDB();
    const post = await WpdPost.create({ ...parsed.data, photoUrl });
    return NextResponse.json({ ok: true, id: post._id.toString() }, { status: 201 });
  } catch (error) {
    console.error("[wpd-post] failed:", error);
    return NextResponse.json({ error: "Could not save your WPD post." }, { status: 500 });
  }
}
