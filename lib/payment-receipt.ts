/**
 * Payment receipt PDF for delegates who paid through Razorpay (server or script only).
 *
 * Drawn on top of the APTICON letterhead so it matches the printed receipt. Positions are given in
 * pixels of the letterhead image, measured from its top-left corner, and mapped onto the A4 page.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export interface PaymentReceiptData {
  /** e.g. "APTICON/2026/AM1178" */
  receiptNo: string;
  paidOn: Date;
  name: string;
  designation: string;
  /** Institution and city, joined for the "Received" block. */
  institution: string;
  /** Total paid in INR. */
  amount: number;
  /** False for categories where the fee already is the final amount (no GST added). */
  gstIncluded: boolean;
}

export interface PaymentReceiptAssets {
  /** A4 portrait letterhead, JPEG. */
  letterhead: Buffer;
  /** TTF font with the ₹ glyph. Standard PDF fonts do not include it. */
  font: Buffer;
}

// A4 portrait, in PDF points.
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const IMG_W = 1379;
const IMG_H = 1951;
const SCALE_X = PAGE_W / IMG_W;
const SCALE_Y = PAGE_H / IMG_H;

/** Letterhead pixel → PDF point. `px` is the x coordinate, `py` the y coordinate from the top. */
const px = (value: number) => value * SCALE_X;
const py = (value: number) => PAGE_H - value * SCALE_Y;

const INK = rgb(0.067, 0.094, 0.153);
const BLUE = rgb(0.18, 0.46, 0.71);
const RULE = rgb(0.6, 0.6, 0.6);

// Table geometry, in letterhead pixels.
const TABLE_LEFT = 154;
const TABLE_RIGHT = 1224;
const TABLE_DIVIDER = 406;
const TABLE_TOP = 764;
const ROW_HEIGHT = 32;
const TEXT_LEFT = 167;
const VALUE_LEFT = 422;

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  return `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ""}`;
}

function threeDigitWords(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  return [hundreds ? `${ONES[hundreds]} Hundred` : "", rest ? twoDigitWords(rest) : ""]
    .filter(Boolean)
    .join(" ");
}

/** Indian numbering (thousand, lakh, crore), e.g. 3540 → "Three Thousand Five Hundred Forty". */
export function amountInWords(amount: number): string {
  let rest = Math.round(amount);
  if (rest === 0) return "Zero";
  const crore = Math.floor(rest / 1e7);
  rest %= 1e7;
  const lakh = Math.floor(rest / 1e5);
  rest %= 1e5;
  const thousand = Math.floor(rest / 1000);
  rest %= 1000;

  const parts: string[] = [];
  if (crore) parts.push(`${amountInWords(crore)} Crore`);
  if (lakh) parts.push(`${twoDigitWords(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigitWords(thousand)} Thousand`);
  if (rest) parts.push(threeDigitWords(rest));
  return parts.join(" ");
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** Standard PDF fonts and embedded fonts only cover the glyphs they contain. Drop the rest. */
function printable(font: PDFFont, text: string): string {
  const supported = new Set(font.getCharacterSet());
  return [...text.normalize("NFC")]
    .filter((ch) => supported.has(ch.codePointAt(0)!))
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

interface TextOptions {
  font: PDFFont;
  size: number;
  color?: ReturnType<typeof rgb>;
  /** Shrink the text until it fits this width, in letterhead pixels. */
  maxWidthPx?: number;
  align?: "left" | "right" | "center";
}

function drawText(page: PDFPage, text: string, x: number, baseline: number, opts: TextOptions) {
  const clean = printable(opts.font, text);
  if (!clean) return;
  let size = opts.size;
  const maxWidth = opts.maxWidthPx !== undefined ? px(opts.maxWidthPx) : Infinity;
  while (size > 7 && opts.font.widthOfTextAtSize(clean, size) > maxWidth) size -= 0.5;

  const width = opts.font.widthOfTextAtSize(clean, size);
  const left =
    opts.align === "right" ? px(x) - width : opts.align === "center" ? px(x) - width / 2 : px(x);
  page.drawText(clean, {
    x: left,
    y: py(baseline),
    size,
    font: opts.font,
    color: opts.color ?? INK,
  });
}

function drawRule(page: PDFPage, x1: number, y1: number, x2: number, y2: number) {
  page.drawLine({
    start: { x: px(x1), y: py(y1) },
    end: { x: px(x2), y: py(y2) },
    thickness: 0.6,
    color: RULE,
  });
}

export async function buildPaymentReceiptPdf(
  data: PaymentReceiptData,
  assets: PaymentReceiptAssets,
): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const letterhead = await doc.embedJpg(assets.letterhead);
  const body = await doc.embedFont(assets.font, { subset: true });
  const heading = await doc.embedFont(StandardFonts.HelveticaBold);
  const headingItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

  const page = doc.addPage([PAGE_W, PAGE_H]);
  page.drawImage(letterhead, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

  drawText(page, "RECEIPT", IMG_W / 2, 385, { font: heading, size: 13, align: "center" });

  drawText(page, `Receipt No: ${data.receiptNo}`, TEXT_LEFT, 450, { font: body, size: 10.5 });
  const dateText = `Date : ${DATE_FORMAT.format(data.paidOn)}`;
  drawText(page, dateText, 1190, 450, { font: headingItalic, size: 10.5, align: "right" });

  drawText(page, "Received:", TEXT_LEFT, 512, { font: heading, size: 10.5, color: BLUE });
  drawText(page, data.name, TEXT_LEFT, 537, { font: body, size: 10.5, maxWidthPx: 1000 });
  drawText(page, data.designation, TEXT_LEFT, 561, { font: body, size: 10.5, maxWidthPx: 1000 });
  drawText(page, data.institution, TEXT_LEFT, 586, { font: body, size: 10.5, maxWidthPx: 1000 });

  drawText(page, "Receipt Details:", TEXT_LEFT, 700, { font: heading, size: 13, color: BLUE });

  const words = amountInWords(data.amount).toLowerCase();
  const amountText = `₹ ${data.amount.toLocaleString("en-IN")} (${words.charAt(0).toUpperCase()}${words.slice(1)} Rupees Only)`;
  const rows: [string, string][] = [
    ["Mode of Payment", "Razorpay"],
    ["Amount Received", amountText],
    ["Purpose", "Registration for APTICON 2026"],
    ["Note", data.gstIncluded ? "GST 18 % Included." : "Fixed fee, no additional GST."],
  ];
  rows.forEach(([label, value], index) => {
    const top = TABLE_TOP + index * ROW_HEIGHT;
    const baseline = top + ROW_HEIGHT / 2 + 4;
    drawText(page, label, TABLE_LEFT + 16, baseline, { font: body, size: 10.5 });
    drawText(page, value, VALUE_LEFT, baseline, {
      font: body,
      size: 10.5,
      maxWidthPx: TABLE_RIGHT - VALUE_LEFT - 12,
    });
  });

  const tableBottom = TABLE_TOP + rows.length * ROW_HEIGHT;
  for (let i = 0; i <= rows.length; i++) {
    const y = TABLE_TOP + i * ROW_HEIGHT;
    drawRule(page, TABLE_LEFT, y, TABLE_RIGHT, y);
  }
  drawRule(page, TABLE_LEFT, TABLE_TOP, TABLE_LEFT, tableBottom);
  drawRule(page, TABLE_DIVIDER, TABLE_TOP, TABLE_DIVIDER, tableBottom);
  drawRule(page, TABLE_RIGHT, TABLE_TOP, TABLE_RIGHT, tableBottom);

  drawText(page, "for APTI Trust", TEXT_LEFT, 982, { font: body, size: 10.5 });
  drawText(page, "Authorised Signatory", TEXT_LEFT, 1082, { font: body, size: 10.5 });
  drawText(page, "(This is E-Receipt no signature required)", TEXT_LEFT, 1116, {
    font: body,
    size: 9,
  });

  return Buffer.from(await doc.save());
}
