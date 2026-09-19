import { ImageResponse } from "next/og";
import { NextResponse } from "next/server";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";

// Template dimensions — must match APTICON-2026-registered-post.png.
const WIDTH = 1023;
const HEIGHT = 1537;

// Circular photo frame — keep in sync with SocialPostClient layout comment.
const PHOTO_SIZE = Math.round(WIDTH * 0.55); // 563 px
const PHOTO_LEFT = Math.round(WIDTH * 0.715 - PHOTO_SIZE / 2); // 450 px
const PHOTO_TOP = Math.round(HEIGHT * 0.198); // 304 px

// Name text: center point and available width within the right panel.
const NAME_CENTER_X = Math.round(WIDTH * 0.725); // 742 px
const NAME_CENTER_Y = Math.round(HEIGHT * 0.68); // 1045 px
const NAME_AREA_WIDTH = Math.round(WIDTH * 0.44); // ~450 px

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

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Read the template from disk and encode as a data URI so the image is
  // fully self-contained. Passing a same-origin URL to Satori fails on Vercel
  // because the Lambda container cannot resolve its own domain at runtime.
  const templateBuffer = await readFile(
    path.join(process.cwd(), "public", "APTICON-2026-registered-post.png"),
  );
  const templateSrc = `data:image/png;base64,${templateBuffer.toString("base64")}`;

  // Read the font via Node's fs — Next.js file tracing picks up readFile
  // calls and bundles the asset into the serverless function automatically.
  // Satori receives it as an ArrayBuffer through the fonts option, so no
  // SVG @font-face or data: URIs are needed.
  const fontBuffer = await readFile(
    path.join(
      process.cwd(),
      "node_modules",
      "next",
      "dist",
      "compiled",
      "@vercel",
      "og",
      "Geist-Regular.ttf",
    ),
  );
  const fontData = fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength,
  ) as ArrayBuffer;

  // Pre-fetch the delegate photo so we can degrade gracefully on any error.
  let photoSrc: string | null = null;
  if (registration.photoUrl) {
    try {
      const res = await fetch(registration.photoUrl);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        // Encode as a data URI so Satori has the bytes without a second fetch.
        photoSrc = `data:image/jpeg;base64,${buf.toString("base64")}`;
      }
    } catch {
      // Template remains usable without the photo.
    }
  }

  const displayName = registration.fullName.toUpperCase();
  const nameFontSize = Math.max(
    32,
    Math.min(
      68,
      Math.floor((NAME_AREA_WIDTH * 1.5) / Math.max(displayName.length, 6)),
    ),
  );

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          overflow: "hidden",
        }}
      >
        {/* Background template (served from Vercel CDN / local public dir) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={templateSrc}
          width={WIDTH}
          height={HEIGHT}
          style={{ position: "absolute", top: 0, left: 0 }}
          alt=""
        />

        {/* Circular delegate photo */}
        {photoSrc && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoSrc}
            width={PHOTO_SIZE}
            height={PHOTO_SIZE}
            style={{
              position: "absolute",
              left: PHOTO_LEFT,
              top: PHOTO_TOP,
              borderRadius: "50%",
              objectFit: "cover",
            }}
            alt=""
          />
        )}

        {/* Delegate name */}
        <div
          style={{
            position: "absolute",
            left: NAME_CENTER_X - NAME_AREA_WIDTH / 2,
            top: NAME_CENTER_Y - nameFontSize * 0.75,
            width: NAME_AREA_WIDTH,
            height: nameFontSize * 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Geist",
            fontSize: nameFontSize,
            fontWeight: 400,
            color: "#7d102e",
          }}
        >
          {displayName}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Geist",
          data: fontData,
          weight: 400,
          style: "normal",
        },
      ],
      headers: {
        "content-disposition": `attachment; filename="APTICON-2026-${registration.registrationCode}-social-post.png"`,
        "cache-control": "no-store",
      },
    },
  );
}
