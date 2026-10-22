"use client";
import { useEffect, useState } from "react";
import { Award, CheckCircle2, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import { Card, CardContent } from "@/components/ui/shadcn/card";

interface Props {
  code: string;
  email: string;
  name: string;
  /** True right after submitting the form, to thank the delegate for it. */
  justSubmitted: boolean;
}

async function fetchCertificate(code: string, email: string, preview: boolean) {
  const res = await fetch("/api/event-feedback/certificate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, email, preview }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "Could not load your certificate");
  }
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const filename = /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? "APTICON-2026-Certificate.pdf";
  return { blob: await res.blob(), filename };
}

/** Shows the delegate's certificate (inline preview on larger screens) and lets them download it. */
export default function CertificateStep({ code, email, name, justSubmitted }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    fetchCertificate(code, email, true)
      .then(({ blob }) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      })
      .catch((e) => {
        if (!cancelled)
          setPreviewError(e instanceof Error ? e.message : "Could not load your certificate");
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [code, email]);

  async function download() {
    setDownloading(true);
    try {
      const { blob, filename } = await fetchCertificate(code, email, false);
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardContent className="pt-6 space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            {justSubmitted ? <CheckCircle2 size={28} /> : <Award size={28} />}
          </div>
          <h2 className="font-display text-2xl font-black text-[var(--primary-800)]">
            {justSubmitted ? "Thank you for your feedback!" : "Your certificate is ready"}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted-text)]">
            {justSubmitted
              ? `${name}, your participation certificate is now unlocked.`
              : `Welcome back, ${name}. Your feedback is on file, so your certificate is available.`}
          </p>
        </div>

        {previewUrl && (
          <iframe
            title="Certificate preview"
            src={`${previewUrl}#view=Fit&toolbar=0&navpanes=0&scrollbar=0`}
            className="hidden aspect-[842/595] w-full rounded-lg border border-[var(--accent-500)]/25 bg-white md:block"
          />
        )}
        {!previewUrl && !previewError && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-[var(--muted-text)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Preparing your certificate…
          </div>
        )}
        {previewError && (
          <p className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-800">
            {previewError}
          </p>
        )}

        <div className="text-center">
          <Button size="lg" variant="gold" onClick={download} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download certificate (PDF)
          </Button>
          <p className="mt-3 text-xs text-[var(--muted-text)]">
            Lost it? Come back to this page any time with your registration code and email.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
