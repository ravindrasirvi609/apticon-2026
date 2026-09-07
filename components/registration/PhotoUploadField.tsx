"use client";
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { CheckCircle2, ImagePlus, UploadCloud, User, X } from "lucide-react";
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
export default function PhotoUploadField({
  file,
  onChange,
  error,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Derived during render rather than in an effect, so selecting a file paints the preview in
  // one pass. The effect exists only to revoke the blob — object URLs leak otherwise.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );
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
    if (
      !UPLOAD_PHOTO_TYPES.includes(
        next.type as (typeof UPLOAD_PHOTO_TYPES)[number],
      )
    ) {
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

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    if (!disabled) pick(event.dataTransfer.files?.[0] ?? null);
  }

  const message = localError ?? error;

  return (
    <div>
      <Label htmlFor="photo">Profile Photo *</Label>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-describedby="photo-help"
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`group relative mt-2 overflow-hidden rounded-2xl border-2 border-dashed p-4 transition-all sm:p-5 ${
          message
            ? "border-red-400 bg-red-50/50"
            : isDragging
              ? "border-[var(--primary-700)] bg-[var(--primary-800)]/[0.06] shadow-lg shadow-[var(--primary-800)]/10"
              : "border-[var(--accent-500)]/30 bg-white/70 hover:border-[var(--primary-800)]/50 hover:bg-white"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-100)] ring-1 ring-black/5 sm:h-24 sm:w-24">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Selected profile photo preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <User
                  className="h-8 w-8 text-[var(--muted-text)]/40"
                  aria-hidden
                />
              </div>
            )}
            {file && (
              <span className="absolute bottom-1 right-1 rounded-full bg-white p-0.5 text-emerald-600 shadow">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--dark-text)]">
              {isDragging
                ? "Drop your photo here"
                : file
                  ? "Photo ready to upload"
                  : "Add your profile photo"}
              {!file && (
                <ImagePlus
                  className="h-4 w-4 text-[var(--accent-500)]"
                  aria-hidden
                />
              )}
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--muted-text)]">
              {file ? (
                <span className="block truncate font-medium text-[var(--primary-800)]">
                  {file.name}
                </span>
              ) : (
                <>
                  Drag & drop here, or{" "}
                  <span className="font-semibold text-[var(--primary-800)]">
                    browse files
                  </span>
                </>
              )}
              <span className="block">
                {UPLOAD_RULES.photo.label} · max {MAX_MB} MB
              </span>
            </p>
          </div>
          <UploadCloud
            className={`hidden h-7 w-7 shrink-0 transition-colors sm:block ${isDragging ? "text-[var(--primary-800)]" : "text-[var(--accent-500)]/60"}`}
            aria-hidden
          />
        </div>
        {file && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={(event) => {
              event.stopPropagation();
              clear();
            }}
            className="absolute right-2 top-2"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        )}
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
      <p id="photo-help" className="mt-2 text-xs text-[var(--muted-text)]">
        Use a clear, front-facing photo. It will be shown cropped to a circle,
        so keep your face centred.
      </p>
    </div>
  );
}
