/** Primary WhatsApp template sender: Sendrix. Kept behind the existing helper API. */
const ENDPOINT = "https://sendrixbackend.exebee.com/v1/messages";
type TemplateMessage = {
  name: string;
  language?: string;
  variables?: Record<string, string>;
};

function normalisePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length > 10 && digits.startsWith("91")) return digits;
  return null;
}

export async function sendWhatsAppTemplate(
  phone: string,
  template: TemplateMessage,
  idempotencyKey?: string,
) {
  const apiKey = process.env.SENDRIX_API_KEY;
  if (!apiKey) {
    console.warn("[whatsapp] skipped", {
      reason: "missing_api_key",
      template: template.name,
    });
    return { skipped: true as const };
  }
  const to = normalisePhone(phone);
  if (!to) {
    console.warn("[whatsapp] skipped", {
      reason: "invalid_phone",
      template: template.name,
    });
    return { skipped: true as const };
  }
  console.info("[whatsapp] sending", {
    template: template.name,
    toLast4: to.slice(-4),
    idempotencyKey,
  });
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: JSON.stringify({ to, template }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("[whatsapp] failed", {
      template: template.name,
      status: response.status,
      toLast4: to.slice(-4),
    });
    throw new Error(
      `Sendrix WhatsApp API failed (${response.status}): ${JSON.stringify(payload).slice(0, 500)}`,
    );
  }
  console.info("[whatsapp] sent", {
    template: template.name,
    toLast4: to.slice(-4),
  });
  return payload;
}

export async function sendWhatsAppNotification(
  phone: string | undefined,
  event: string,
  bodyValues: string[],
  callbackData?: string,
) {
  const templateName =
    process.env[`SENDRIX_TEMPLATE_${event.toUpperCase()}`] ??
    (event === "registration_approved" ? "test" : undefined);
  if (!phone || !templateName) {
    console.info("[whatsapp] skipped", {
      event,
      reason: !phone ? "missing_phone" : "missing_template",
    });
    return;
  }
  try {
    await sendWhatsAppTemplate(
      phone,
      {
        name: templateName,
        language: process.env.SENDRIX_TEMPLATE_LANGUAGE ?? "en",
        variables: Object.fromEntries(
          bodyValues.map((value, index) => [String(index + 1), value]),
        ),
      },
      callbackData,
    );
  } catch (error) {
    console.error(`[whatsapp] ${event} notification failed`, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
