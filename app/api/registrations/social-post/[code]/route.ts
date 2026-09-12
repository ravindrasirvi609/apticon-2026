import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  await connectDB();
  const registration = await Registration.findOne({
    registrationCode: code.toUpperCase(),
  })
    .select("registrationCode fullName photoUrl")
    .lean();

  if (!registration) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const template = await readFile(
    path.join(process.cwd(), "public", "APTICON-2026-registered-post.png"),
  );
  const image = sharp(template);
  const metadata = await image.metadata();
  const width = metadata.width ?? 1024;
  const height = metadata.height ?? 1536;
  // Keep these values in sync with the preview layout in SocialPostClient.
  const size = Math.round(width * 0.55);
  const x = Math.round(width * 0.715 - size / 2);
  const y = Math.round(height * 0.198);
  const name = registration.fullName.replace(/[<>&'"`]/g, "");
  const overlays: sharp.OverlayOptions[] = [];

  if (registration.photoUrl) {
    try {
      const response = await fetch(registration.photoUrl);
      if (response.ok) {
        const photo = Buffer.from(await response.arrayBuffer());
        const photoData = `data:image/png;base64,${(await sharp(photo).png().toBuffer()).toString("base64")}`;
        overlays.push({
          input: Buffer.from(
            `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="c"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></clipPath></defs><image href="${photoData}" width="${size}" height="${size}" preserveAspectRatio="xMidYMid slice" clip-path="url(#c)"/></svg>`,
          ),
          left: x,
          top: y,
        });
      }
    } catch {
      // The template remains usable if an old photo URL is unavailable.
    }
  }

  overlays.push({
    input: Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="${width * 0.725}" y="${height * 0.68}" text-anchor="middle" fill="#7d102e" font-family="Arial, sans-serif" font-size="${Math.max(24, Math.round(width * 0.025))}" font-weight="900">${name.toUpperCase()}</text></svg>`,
    ),
  });

  const output = await image.composite(overlays).png().toBuffer();
  return new NextResponse(new Uint8Array(output), {
    headers: {
      "content-type": "image/png",
      "content-disposition": `attachment; filename="APTICON-2026-${registration.registrationCode}-social-post.png"`,
      "cache-control": "no-store",
    },
  });
}
