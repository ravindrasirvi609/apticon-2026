import crypto from "crypto";

const API_URL = "https://api.razorpay.com/v1";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: "created" | "attempted" | "paid";
};

export type RazorpayPayment = {
  id: string;
  amount: number;
  currency: string;
  order_id: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  method?: string;
  error_code?: string | null;
  error_description?: string | null;
};

function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");
  return { keyId, keySecret };
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const { keyId, keySecret } = credentials();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "content-type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => null) as { error?: { description?: string } } | T | null;
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body ? body.error?.description : undefined;
    throw new Error(message || "Unable to communicate with Razorpay");
  }
  return body as T;
}

export async function createRazorpayOrder(input: { amount: number; receipt: string; notes: Record<string, string> }) {
  return api<RazorpayOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({ amount: input.amount, currency: "INR", receipt: input.receipt, notes: input.notes }),
  });
}

export async function getRazorpayPayment(paymentId: string) {
  return api<RazorpayPayment>(`/payments/${encodeURIComponent(paymentId)}`);
}

export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = credentials();
  const expected = crypto.createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function verifyRazorpayWebhookSignature(rawBody: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
