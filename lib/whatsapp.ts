/** Interakt WhatsApp template delivery.
 *
 * Interakt only sends approved WhatsApp templates. Each notification supplies its
 * template name through an environment variable, so changing a template in the
 * Interakt dashboard never requires a code change.
 */
const ENDPOINT = "https://api.interakt.ai/v1/public/message/";

type TemplateMessage = {
  name: string;
  languageCode?: string;
  bodyValues?: string[];
  headerValues?: string[];
};

function phoneParts(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return { countryCode: "+91", phoneNumber: digits };
  if (digits.length > 10 && digits.startsWith("91")) return { countryCode: "+91", phoneNumber: digits.slice(-10) };
  return null;
}

export async function sendWhatsAppTemplate(phone: string, template: TemplateMessage, callbackData?: string) {
  const apiKey = process.env.INTERAKT_API_KEY;
  if (!apiKey) {
    console.warn("[whatsapp] INTERAKT_API_KEY missing — skipping send");
    return { skipped: true as const };
  }
  const recipient = phoneParts(phone);
  if (!recipient) {
    console.warn("[whatsapp] invalid phone — skipping send", phone);
    return { skipped: true as const };
  }

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Basic ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      ...recipient,
      callbackData,
      type: "Template",
      template: { name: template.name, languageCode: template.languageCode ?? "en", ...(template.bodyValues?.length ? { bodyValues: template.bodyValues } : {}), ...(template.headerValues?.length ? { headerValues: template.headerValues } : {}) },
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.result === false) {
    throw new Error(`Interakt WhatsApp API failed (${response.status}): ${JSON.stringify(payload).slice(0, 500)}`);
  }
  return payload as { result: true; id?: string; message?: string };
}

export async function sendWhatsAppNotification(phone: string | undefined, event: string, bodyValues: string[], callbackData?: string) {
  const templateName = process.env[`INTERAKT_TEMPLATE_${event.toUpperCase()}`];
  if (!phone || !templateName) return;
  try {
    await sendWhatsAppTemplate(phone, { name: templateName, languageCode: process.env.INTERAKT_TEMPLATE_LANGUAGE ?? "en", bodyValues }, callbackData);
  } catch (error) {
    // Notification delivery must never roll back a registration/payment operation.
    console.error(`[whatsapp] ${event} notification failed`, error);
  }
}
