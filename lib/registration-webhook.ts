const REGISTRATION_WEBHOOK_URL =
  "https://wehook.campaignplus.in/webhook/6a8ec1785610676a8836e99c";

/** Sends the minimum registration details required by the CampaignPlus POC webhook. */
export async function sendRegistrationWebhook(name: string, mobile: string | undefined) {
  if (!mobile) return;

  try {
    const response = await fetch(REGISTRATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mobile }),
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      throw new Error(`CampaignPlus webhook failed (${response.status}): ${responseBody.slice(0, 300)}`);
    }
  } catch (error) {
    // The registration is already complete; a notification outage must not roll it back.
    console.error("[registration-webhook] CampaignPlus notification failed", error);
  }
}
