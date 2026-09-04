/** Server-only WhatsApp template sender backed by Interakt. */
const ENDPOINT = "https://api.interakt.ai/v1/public/message/";
type TemplateMessage = {
  name: string;
  languageCode?: string;
  bodyValues?: string[];
};

function normalisePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return { countryCode: "+91", phoneNumber: digits };
  if (digits.length > 10 && digits.startsWith("91"))
    return { countryCode: "+91", phoneNumber: digits.slice(2) };
  return null;
}

export async function sendWhatsAppTemplate(
  phone: string,
  template: TemplateMessage,
  idempotencyKey?: string,
) {
  const apiKey = process.env.INTERAKT_API_KEY;
  if (!apiKey) {
    console.warn("[whatsapp] INTERAKT_API_KEY missing — skipping send");
    return { skipped: true as const };
  }
  const to = normalisePhone(phone);
  if (!to) {
    console.warn("[whatsapp] invalid phone — skipping send", phone);
    return { skipped: true as const };
  }
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      countryCode: to.countryCode,
      phoneNumber: to.phoneNumber,
      callbackData: idempotencyKey,
      type: "Template",
      template,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      `Interakt WhatsApp API failed (${response.status}): ${JSON.stringify(payload).slice(0, 500)}`,
    );
  return payload;
}

export async function sendWhatsAppNotification(
  phone: string | undefined,
  event: string,
  bodyValues: string[],
  callbackData?: string,
) {
  const templateName = process.env[`INTERAKT_TEMPLATE_${event.toUpperCase()}`];
  if (!phone || !templateName) return;
  try {
    await sendWhatsAppTemplate(
      phone,
      {
        name: templateName,
        languageCode: process.env.INTERAKT_TEMPLATE_LANGUAGE ?? "en",
        bodyValues,
      },
      callbackData,
    );
  } catch (error) {
    console.error(`[whatsapp] ${event} notification failed`, error);
  }
}
