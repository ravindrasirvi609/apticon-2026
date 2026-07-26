import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";

export default async function RegistrationSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[var(--cream-50)]">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--crimson-800)] mb-2">Registration Received</h1>
          <p className="text-[var(--muted-text)]">Your payment proof is under review.</p>

          <div className="mt-6 rounded-xl border border-[var(--gold-500)]/30 bg-[var(--cream-100)] p-5">
            <div className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-text)]">Your Registration Code</div>
            <div className="mt-1 font-mono text-2xl font-black text-[var(--crimson-800)]">{code}</div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900 text-left">
            <b>What happens next?</b>
            <ol className="mt-2 space-y-1 list-decimal list-inside">
              <li>Our team will verify your payment (typically within 2 working days).</li>
              <li>You'll receive a final confirmation email once approved.</li>
              <li>Bring your registration code to the venue for kit collection.</li>
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
