"use client";
import { useState } from "react";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";

export default function ExportButtons({ endpoint, query, label }: { endpoint: string; query: string; label: string }) {
  const [downloading, setDownloading] = useState<"xlsx" | "csv" | null>(null);
  async function download(format: "xlsx" | "csv") {
    setDownloading(format);
    try {
      const res = await fetch(`${endpoint}?${query}${query ? "&" : ""}format=${format}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const match = /filename="?([^";]+)"?/i.exec(res.headers.get("Content-Disposition") ?? "");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = match?.[1] ?? `${label}.${format}`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(a.href);
      toast.success(`${label} exported as ${format.toUpperCase()}`);
    } catch { toast.error(`Failed to export ${label.toLowerCase()}`); }
    finally { setDownloading(null); }
  }
  return <div className="flex items-center gap-2">
    <Button onClick={() => download("xlsx")} disabled={!!downloading} variant="outline" size="sm">
      {downloading === "xlsx" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />} Excel
    </Button>
    <Button onClick={() => download("csv")} disabled={!!downloading} variant="outline" size="sm">
      {downloading === "csv" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} CSV
    </Button>
  </div>;
}
