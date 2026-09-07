import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { generateRegistrationQrDataUrl } from "@/lib/qrcode";

export default async function RegistrationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { code } = await params;
  const { payment } = await searchParams;
  const confirmed = payment === "confirmed";
  const hasCode = code !== "pending";
  const qrDataUrl = hasCode ? await generateRegistrationQrDataUrl(code) : null;
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[var(--surface-50)]">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--primary-800)] mb-2">
            {confirmed ? "Registration Confirmed" : "Payment Processing"}
          </h1>
          <p className="text-[var(--muted-text)]">
            {confirmed
              ? "Your Razorpay payment has been confirmed."
              : "Your payment is being confirmed automatically by Razorpay."}
          </p>

          <div className="mt-6 rounded-xl border border-[var(--accent-500)]/30 bg-[var(--surface-100)] p-5">
            <div className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-text)]">
              Your Registration Code
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-[var(--primary-800)]">
              {hasCode ? code : "Assigned after payment confirmation"}
            </div>
            {qrDataUrl && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl}
                  alt="QR code encoding your registration code"
                  width={180}
                  height={180}
                  className="rounded-lg border border-[var(--accent-500)]/20 bg-white p-2"
                />
                <p className="text-xs text-[var(--muted-text)]">
                  Scan this at the registration desk
                </p>
              </div>
            )}
          </div>

          <div
            className={`mt-6 p-4 rounded-lg text-sm text-left ${confirmed ? "bg-emerald-50 border border-emerald-200 text-emerald-900" : "bg-amber-50 border border-amber-200 text-amber-900"}`}
          >
            <b>What happens next?</b>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>
                {confirmed
                  ? "Your payment and registration are complete."
                  : "Razorpay will confirm the payment automatically; this normally takes only a moment."}
              </li>
              <li>
                You&apos;ll receive a confirmation email when payment capture
                completes.
              </li>
              <li>
                Bring your registration code to the venue for kit collection.
              </li>
            </ol>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/registration/status">
              <Button variant="outline">Check Status</Button>
            </Link>
            <Link href="/abstracts">
              <Button>Submit an Abstract</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
