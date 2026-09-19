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

  const escapedName = registration.fullName
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
  // Scale font size so the name is clearly legible across different name lengths.
  // Usable text area is ~44% of the image width (~450px on the 1023px template).
  const textAreaWidth = Math.round(width * 0.44);
  const nameFontSize = Math.max(
    32,
    Math.min(68, Math.floor((textAreaWidth * 1.5) / Math.max(escapedName.length, 6))),
  );

  // Read the font via Node's fs so Next.js bundles it into the serverless
  // function (file tracing picks up readFile calls). Embed as a base64
  // data URI so the SVG is self-contained and works in any environment —
  // file:// paths are unreliable inside Vercel's Lambda containers because
  // public/ assets are served via CDN and may not exist on the local FS.
  const fontPath = path.join(
    process.cwd(),
    "node_modules",
    "next",
    "dist",
    "compiled",
    "@vercel",
    "og",
    "Geist-Regular.ttf",
  );
  const fontBase64 = (await readFile(fontPath)).toString("base64");

  overlays.push({
    input: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <style>@font-face { font-family: ApticonSocial; src: url(data:font/ttf;base64,${fontBase64}) format('truetype'); }</style>
        <text x="${Math.round(width * 0.725)}" y="${Math.round(height * 0.68)}"
          text-anchor="middle" dominant-baseline="middle"
          fill="#7d102e" font-family="ApticonSocial"
          font-size="${nameFontSize}">${escapedName.toUpperCase()}</text>
      </svg>`,
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
