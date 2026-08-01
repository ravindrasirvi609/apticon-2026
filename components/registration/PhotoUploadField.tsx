"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, User, X } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Label } from "@/components/ui/shadcn/label";
import { UPLOAD_PHOTO_TYPES, UPLOAD_RULES } from "@/lib/validators/upload";

const MAX_MB = UPLOAD_RULES.photo.maxBytes / 1024 / 1024;
const ACCEPT = ".jpg,.jpeg,.png,.webp";

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  /** Validation message from the parent form, shown beneath the control. */
  error?: string;
  disabled?: boolean;
}

/**
 * Square-cropped avatar picker. The image is previewed locally and only uploaded when the form
 * is submitted, so abandoning the form leaves nothing behind in storage.
 */
export default function PhotoUploadField({ file, onChange, error, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Derived during render rather than in an effect, so selecting a file paints the preview in
  // one pass. The effect exists only to revoke the blob — object URLs leak otherwise.
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  function pick(next: File | null) {
    setLocalError(null);
    if (!next) {
      onChange(null);
      return;
    }
    if (!UPLOAD_PHOTO_TYPES.includes(next.type as (typeof UPLOAD_PHOTO_TYPES)[number])) {
      setLocalError(`Choose a ${UPLOAD_RULES.photo.label} image.`);
      onChange(null);
      return;
    }
    if (next.size > UPLOAD_RULES.photo.maxBytes) {
      setLocalError(`Image must be under ${MAX_MB} MB.`);
      onChange(null);
      return;
    }
    onChange(next);
  }

  function clear() {
    pick(null);
    // Without this the same file can't be re-selected after removal.
    if (inputRef.current) inputRef.current.value = "";
  }

  const message = localError ?? error;

  return (
    <div>
      <Label htmlFor="photo">Profile Photo *</Label>
      <div className="mt-2 flex items-center gap-4">
        <div
          className={
            "relative h-20 w-20 shrink-0 overflow-hidden rounded-full border bg-[var(--cream-100)] " +
            (message ? "border-red-400" : "border-[var(--gold-500)]/30")
          }
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Selected profile photo preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-8 w-8 text-[var(--muted-text)]/50" aria-hidden />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {file ? "Change photo" : "Upload photo"}
            </Button>
            {file && (
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={clear}>
                <X className="h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
          <p className="mt-1.5 truncate text-xs text-[var(--muted-text)]">
            {file ? file.name : `${UPLOAD_RULES.photo.label}, max ${MAX_MB} MB. Used on your delegate badge.`}
          </p>
        </div>

        <input
          ref={inputRef}
          id="photo"
          type="file"
          accept={ACCEPT}
          className="hidden"
          disabled={disabled}
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />
      </div>
      {message && <p className="mt-1 text-xs text-red-600">{message}</p>}
      <p className="mt-1.5 text-xs text-[var(--muted-text)]">
        Use a clear, front-facing photo. It will be shown cropped to a circle, so keep your face centred.
      </p>
    </div>
  );
}
