import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";

export default async function GroupRegistrationSuccessPage({
  params, searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { code } = await params;
  const { payment } = await searchParams;
  const confirmed = payment === "confirmed";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[var(--surface-50)]">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--primary-800)] mb-2">
            {confirmed ? "Group Registration Confirmed" : "Payment Processing"}
          </h1>
          <p className="text-[var(--muted-text)]">
            {confirmed ? "Your payment and group registration have been confirmed." : "Your payment is being confirmed automatically by Razorpay."}
          </p>

          <div className="mt-6 rounded-xl border border-[var(--accent-500)]/30 bg-[var(--surface-100)] p-5">
            <div className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-text)]">Your Group Registration Code</div>
            <div className="mt-1 font-mono text-2xl font-black text-[var(--primary-800)]">{code}</div>
          </div>

          <div className="mt-6 p-4 rounded-lg text-sm text-left bg-amber-50 border border-amber-200 text-amber-900">
            <b>What happens next?</b>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Your payment has been verified automatically.</li>
              <li>Every delegate (and you as coordinator) will receive an email with their own registration code and QR badge.</li>
              <li>Keep this group code for your records when following up with the organiser.</li>
            </ol>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/registration/status">
              <Button variant="outline">Check Individual Status</Button>
            </Link>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
