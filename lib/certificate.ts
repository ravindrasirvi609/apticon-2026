/**
 * Personalised APTICON 2026 participation certificate based on the approved artwork.
 * The source design lives at public/certificate-delegates.jpeg.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export interface CertificateData {
  name: string;
  registrationCode: string;
  institution?: string;
}

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "public",
  "certificate-delegates.jpeg",
);
const PDF_WIDTH = 595.28;
const NAME_Y_FROM_TOP = 0.456;
const INSTITUTION_Y_FROM_TOP = 0.482;
const REGISTRATION_Y_FROM_TOP = 0.814;
const TEXT_COLOR = rgb(0.08, 0.07, 0.06);

/** Standard PDF fonts only cover Latin-1; drop unsupported glyphs rather than failing a download. */
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
  value: string,
  y: number,
  size: number,
  maxWidth: number,
  centerRatio: number,
) {
  let text = printable(font, value);
  if (!text) return;

  let fittedSize = size;
  while (fittedSize > 8 && font.widthOfTextAtSize(text, fittedSize) > maxWidth)
    fittedSize -= 0.5;
  if (font.widthOfTextAtSize(text, fittedSize) > maxWidth) {
    while (text.length > 1 && font.widthOfTextAtSize(`${text}…`, fittedSize) > maxWidth)
      text = text.slice(0, -1);
    text = `${text.trimEnd()}…`;
  }

  const textWidth = font.widthOfTextAtSize(text, fittedSize);
  page.drawText(text, {
    x: PDF_WIDTH * centerRatio - textWidth / 2,
    y,
    size: fittedSize,
    font,
    color: TEXT_COLOR,
  });
}

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const artworkBytes = await readFile(TEMPLATE_PATH);
  const artwork = await doc.embedJpg(artworkBytes);
  const height = PDF_WIDTH * (artwork.height / artwork.width);
  const page = doc.addPage([PDF_WIDTH, height]);

  page.drawImage(artwork, { x: 0, y: 0, width: PDF_WIDTH, height });

  const nameFont = await doc.embedFont(StandardFonts.TimesRomanBold);
  const institutionFont = await doc.embedFont(StandardFonts.TimesRoman);
  // The artwork leaves dotted rules for the delegate's name and institution.
  drawCentered(
    page,
    nameFont,
    data.name,
    height * (1 - NAME_Y_FROM_TOP),
    15,
    PDF_WIDTH * 0.66,
    0.554,
  );
  if (data.institution) {
    drawCentered(
      page,
      institutionFont,
      data.institution,
      height * (1 - INSTITUTION_Y_FROM_TOP),
      12.5,
      PDF_WIDTH * 0.78,
      0.521,
    );
  }
  drawCentered(
    page,
    institutionFont,
    `Registration Code: ${data.registrationCode}`,
    height * (1 - REGISTRATION_Y_FROM_TOP),
    9,
    PDF_WIDTH * 0.7,
    0.5,
  );

  doc.setTitle(`APTICON 2026 Certificate - ${data.registrationCode}`);
  doc.setAuthor("APTICON 2026 Organising Committee");
  return doc.save();
}

/** Safe download name, e.g. APTICON-2026-Certificate-AM1001.pdf */
export function certificateFilename(registrationCode: string): string {
  return `APTICON-2026-Certificate-${registrationCode.replace(/[^A-Za-z0-9_-]/g, "")}.pdf`;
}
