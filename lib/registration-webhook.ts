const SENDRIX_CALLBACK_URL = process.env.SENDRIX_CALLBACK_URL;
const SENDRIX_VERIFY_TOKEN = process.env.SENDRIX_VERIFY_TOKEN;

/** Sends registration details to the configured Sendrix webhook. */
export async function sendRegistrationWebhook(name: string, mobile: string | undefined) {
  if (!mobile || !SENDRIX_CALLBACK_URL) {
    if (!SENDRIX_CALLBACK_URL) console.warn("[registration-webhook] SENDRIX_CALLBACK_URL missing — skipping send");
    return;
  }

  try {
    const response = await fetch(SENDRIX_CALLBACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(SENDRIX_VERIFY_TOKEN ? { "x-verify-token": SENDRIX_VERIFY_TOKEN } : {}),
      },
      body: JSON.stringify({ name, mobile, verify_token: SENDRIX_VERIFY_TOKEN }),
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      throw new Error(`Sendrix webhook failed (${response.status}): ${responseBody.slice(0, 300)}`);
    }
  } catch (error) {
    // The registration is already complete; a notification outage must not roll it back.
    console.error("[registration-webhook] Sendrix notification failed", error);
  }
}
