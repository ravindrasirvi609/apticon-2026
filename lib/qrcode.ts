import QRCode from "qrcode";

/**
 * Encodes a registration's badge identifier as a QR PNG data URL. The payload is always the
 * plain `registrationCode` string — no JSON, no signed token — matching the convention the
 * mobile scanner already expects (see MOBILE_API.md §10): it decodes the raw text and calls
 * `GET /attendees/by-code/{code}` with it.
 *
 * ECC "H" costs nothing extra here: registrationCode is short (legacy `APT-REG-2026-XXXXXX`
 * codes, or newer category-prefixed codes like `AM1001`/`AA501`), well within the alphanumeric-
 * mode capacity of a small QR version even at the highest error correction level, so we get the
 * strongest damage/print tolerance for free.
 */
export async function generateRegistrationQrDataUrl(
  registrationCode: string,
): Promise<string> {
  return QRCode.toDataURL(registrationCode, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
  });
}

/**
 * Same QR content as {@link generateRegistrationQrDataUrl}, but as a PNG buffer suitable for
 * a `cid:`-referenced inline email attachment. Gmail (and Outlook) routinely strip `data:` URI
 * images out of HTML emails, so confirmation emails must attach the PNG and reference it via
 * `cid:` rather than inlining base64 in the `<img src>`.
 */
export async function generateRegistrationQrPngBuffer(
  registrationCode: string,
): Promise<Buffer> {
  return QRCode.toBuffer(registrationCode, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 320,
  });
}
