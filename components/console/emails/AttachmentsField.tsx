"use client";
import { useRef, useState } from "react";
import { FileText, Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/shadcn/button";
import {
  EMAIL_ATTACHMENT_MAX_BYTES,
  EMAIL_ATTACHMENT_MAX_FILES,
  EMAIL_ATTACHMENT_MAX_TOTAL_BYTES,
  EMAIL_ATTACHMENT_TYPES,
  attachmentExtension,
} from "@/lib/email-campaign-shared";
import { formatBytes, type CampaignAttachment } from "./types";

interface Props {
  value: CampaignAttachment[];
  onChange: (next: CampaignAttachment[]) => void;
  disabled?: boolean;
}

const ACCEPT = Object.keys(EMAIL_ATTACHMENT_TYPES)
  .map((e) => `.${e}`)
  .join(",");

export default function AttachmentsField({ value, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    let current = value;
    try {
      for (const file of Array.from(files)) {
        if (current.length >= EMAIL_ATTACHMENT_MAX_FILES) {
          toast.error(`You can attach at most ${EMAIL_ATTACHMENT_MAX_FILES} files.`);
          break;
        }
        if (!EMAIL_ATTACHMENT_TYPES[attachmentExtension(file.name)]) {
          toast.error(`${file.name}: this file type is not allowed.`);
          continue;
        }
        if (file.size === 0 || file.size > EMAIL_ATTACHMENT_MAX_BYTES) {
          toast.error(
            `${file.name}: each file must be under ${EMAIL_ATTACHMENT_MAX_BYTES / 1024 / 1024} MB.`,
          );
          continue;
        }
        const total = current.reduce((n, a) => n + a.size, 0) + file.size;
        if (total > EMAIL_ATTACHMENT_MAX_TOTAL_BYTES) {
          toast.error(
            `Attachments may total ${EMAIL_ATTACHMENT_MAX_TOTAL_BYTES / 1024 / 1024} MB at most.`,
          );
          continue;
        }

        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/admin/emails/attachments", {
          method: "POST",
          body: form,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          // 413 comes from the hosting platform with an HTML body, not our JSON.
          toast.error(
            `${file.name}: ${data.error ?? (res.status === 413 ? "file is too large for the server" : "upload failed")}`,
          );
          continue;
        }
        current = [...current, data as CampaignAttachment];
        onChange(current);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-3 space-y-2">
          {value.map((a) => (
            <li
              key={a.key}
              className="flex items-center gap-3 rounded-lg border border-[var(--accent-500)]/25 bg-[var(--surface-50)] px-3 py-2"
            >
              <FileText className="w-4 h-4 text-[var(--primary-800)] shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{a.filename}</div>
                <div className="text-xs text-[var(--muted-text)]">
                  {formatBytes(a.size)}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={disabled}
                aria-label={`Remove ${a.filename}`}
                onClick={() => onChange(value.filter((x) => x.key !== a.key))}
              >
                <X className="w-4 h-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={
          disabled || uploading || value.length >= EMAIL_ATTACHMENT_MAX_FILES
        }
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Paperclip className="w-4 h-4" />
        )}
        {uploading ? "Uploading…" : "Add attachment"}
      </Button>
      <p className="mt-2 text-xs text-[var(--muted-text)]">
        Up to {EMAIL_ATTACHMENT_MAX_FILES} files, {EMAIL_ATTACHMENT_MAX_BYTES / 1024 / 1024} MB each.
        PDF, Word, Excel, PowerPoint, CSV, TXT, images or ZIP. Every recipient gets every file.
      </p>
    </div>
  );
}
