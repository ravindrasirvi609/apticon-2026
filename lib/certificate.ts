/**
 * Participation certificate generator (server only).
 *
 * THIS IS A PLACEHOLDER DESIGN. When the final certificate artwork is ready, replace the body of
 * `drawCertificate` (or swap the whole function for one that stamps the delegate's name onto the
 * approved template). Everything around it — who may download, when, and the download counter —
 * lives in the API routes and does not need to change.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

/** While true, the PDF carries a small "sample certificate" footer so it can't be mistaken for the final one. */
export const CERTIFICATE_IS_PLACEHOLDER = true;

export interface CertificateData {
  name: string;
  registrationCode: string;
  institution?: string;
}

const PRIMARY = rgb(0.192, 0.18, 0.506); // #312E81
const PRIMARY_DARK = rgb(0.118, 0.106, 0.294); // #1E1B4B
const ACCENT = rgb(0.918, 0.345, 0.047); // #EA580C
const MUTED = rgb(0.278, 0.333, 0.412); // #475569

// A4 landscape, in PDF points.
const WIDTH = 841.89;
const HEIGHT = 595.28;

/** Standard PDF fonts only cover Latin-1; drop anything else rather than failing the download. */
function printable(font: PDFFont, text: string): string {
  const supported = new Set(font.getCharacterSet());
  return [...text.normalize("NFC")]
    .filter((ch) => supported.has(ch.codePointAt(0)!))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function drawCentered(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  color = PRIMARY_DARK,
  maxWidth = WIDTH - 160,
) {
  let clean = printable(font, text);
  if (!clean) return;
  // Shrink long values (e.g. a very long name) until they fit on one line; if even the smallest
  // size is too wide, cut the text rather than let it run through the frame.
  let fitted = size;
  while (fitted > 10 && font.widthOfTextAtSize(clean, fitted) > maxWidth) fitted -= 1;
  if (font.widthOfTextAtSize(clean, fitted) > maxWidth) {
    while (clean.length > 1 && font.widthOfTextAtSize(`${clean}...`, fitted) > maxWidth)
      clean = clean.slice(0, -1);
    clean = `${clean.trimEnd()}...`;
  }
  page.drawText(clean, {
    x: (WIDTH - font.widthOfTextAtSize(clean, fitted)) / 2,
    y,
    size: fitted,
    font,
    color,
  });
}

async function drawCertificate(doc: PDFDocument, data: CertificateData) {
  const page = doc.addPage([WIDTH, HEIGHT]);
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const serifBoldItalic = await doc.embedFont(StandardFonts.TimesRomanBoldItalic);
  const sans = await doc.embedFont(StandardFonts.HelveticaBold);

  // Double frame
  page.drawRectangle({
    x: 22, y: 22, width: WIDTH - 44, height: HEIGHT - 44,
    borderColor: PRIMARY, borderWidth: 3,
  });
  page.drawRectangle({
    x: 32, y: 32, width: WIDTH - 64, height: HEIGHT - 64,
    borderColor: ACCENT, borderWidth: 1,
  });

  drawCentered(page, sans, "APTICON 2026", HEIGHT - 95, 14, ACCENT);
  drawCentered(
    page, serifBold, "Certificate of Participation", HEIGHT - 145, 38, PRIMARY,
  );
  page.drawRectangle({
    x: WIDTH / 2 - 40, y: HEIGHT - 162, width: 80, height: 3, color: ACCENT,
  });

  drawCentered(page, serifItalic, "This is to certify that", HEIGHT - 205, 16, MUTED);
  drawCentered(page, serifBoldItalic, data.name, HEIGHT - 255, 36, PRIMARY_DARK, WIDTH - 200);
  if (data.institution)
    drawCentered(page, serif, data.institution, HEIGHT - 282, 15, MUTED, WIDTH - 200);

  drawCentered(
    page, serif,
    "has actively participated in the 28th Annual National Convention of the",
    HEIGHT - 322, 16, PRIMARY_DARK,
  );
  drawCentered(
    page, serifBold,
    "Association of Pharmaceutical Teachers of India (APTICON 2026)",
    HEIGHT - 346, 17, PRIMARY_DARK,
  );
  drawCentered(
    page, serif,
    "held on 24-25 October 2026 at Pt. Deendayal Upadhyay Auditorium, Raipur, Chhattisgarh.",
    HEIGHT - 370, 14, MUTED,
  );

  // Signature placeholders
  const signatories: [string, number][] = [
    ["Organising Secretary", 190],
    ["Organising Chairman", WIDTH - 190],
  ];
  for (const [label, cx] of signatories) {
    page.drawLine({
      start: { x: cx - 80, y: 105 }, end: { x: cx + 80, y: 105 },
      thickness: 0.8, color: MUTED,
    });
    const w = serif.widthOfTextAtSize(label, 12);
    page.drawText(label, { x: cx - w / 2, y: 88, size: 12, font: serif, color: MUTED });
  }

  const reg = `Registration No: ${data.registrationCode}`;
  const regW = sans.widthOfTextAtSize(reg, 10);
  page.drawText(reg, { x: (WIDTH - regW) / 2, y: 62, size: 10, font: sans, color: PRIMARY });

  if (CERTIFICATE_IS_PLACEHOLDER) {
    drawCentered(
      page, serifItalic,
      "Sample certificate - the final design will replace this one.",
      42, 9, MUTED,
    );
  }
}

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`APTICON 2026 Certificate - ${data.registrationCode}`);
  doc.setAuthor("APTICON 2026 Organising Committee");
  await drawCertificate(doc, data);
  return doc.save();
}

/** Safe download name, e.g. APTICON-2026-Certificate-AM1001.pdf */
export function certificateFilename(registrationCode: string): string {
  return `APTICON-2026-Certificate-${registrationCode.replace(/[^A-Za-z0-9_-]/g, "")}.pdf`;
}
