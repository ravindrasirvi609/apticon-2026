import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";

export default async function AbstractSuccessPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-[var(--surface-50)]">
      <Card className="w-full max-w-lg text-center">
        <CardContent className="pt-10 pb-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="font-display text-3xl font-bold text-[var(--primary-800)] mb-2">Submission Received</h1>
          <p className="text-[var(--muted-text)]">Thank you — your abstract has been submitted to APTICON 2026.</p>

          <div className="mt-6 rounded-xl border border-[var(--accent-500)]/30 bg-[var(--surface-100)] p-5">
            <div className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-text)]">Your Submission Code</div>
            <div className="mt-1 font-mono text-2xl font-black text-[var(--primary-800)]">{code}</div>
          </div>

          <p className="mt-6 text-sm text-[var(--muted-text)]">
            A confirmation email has been sent. Please save your submission code — you'll need it to check the review
            status of your abstract.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/abstracts/status">
              <Button variant="outline">Check Status</Button>
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
