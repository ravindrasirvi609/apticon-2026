"use client";
import { toast } from "sonner";

export const ABSTRACT_FILE_MIME: Record<
  string,
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
> = {
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const IMAGE_MIME: Record<
  string,
  "image/jpeg" | "image/png" | "image/webp"
> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function uploadPublicFile(
  f: File,
  purpose: "abstract" | "graphicalAbstract",
  allowedMime: Record<string, string>,
  maxBytes: number,
): Promise<{ key: string } | null> {
  const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = allowedMime[ext];
  if (!contentType) {
    toast.error(
      purpose === "abstract"
        ? "Only DOC or DOCX files are allowed."
        : "Only JPG, PNG or WebP images are allowed.",
    );
    return null;
  }
  if (f.size > maxBytes) {
    toast.error(`File must be under ${maxBytes / 1024 / 1024} MB.`);
    return null;
  }
  const uploadData = new FormData();
  uploadData.append("file", f);
  uploadData.append("purpose", purpose);
  const uploadRes = await fetch("/api/upload", {
    method: "POST",
    body: uploadData,
  });
  if (!uploadRes.ok) {
    toast.error("File upload failed.");
    return null;
  }
  const { key } = (await uploadRes.json()) as { key: string };
  return { key };
}
