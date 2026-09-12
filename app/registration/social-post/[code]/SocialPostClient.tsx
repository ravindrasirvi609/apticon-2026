"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

interface Props {
  name: string;
  photoUrl?: string;
  code: string;
}

export default function SocialPostClient({ name, photoUrl, code }: Props) {
  const downloadPost = async () => {
    const response = await fetch(`/api/registrations/social-post/${encodeURIComponent(code)}`);
    if (!response.ok) return;
    const blob = await response.blob();
    const link = document.createElement("a");
    link.download = `APTICON-2026-${code}-social-post.png`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <div className="relative mx-auto mt-8 w-full max-w-[512px] overflow-hidden rounded-xl bg-white shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/registrations/social-post/${encodeURIComponent(code)}`}
          alt="APTICON 2026 registration social post"
          className="block h-auto w-full"
        />
      </div>
      <Button onClick={downloadPost} className="mt-6">
        <Download className="mr-2 h-4 w-4" />
        Download PNG
      </Button>
    </>
  );
}
