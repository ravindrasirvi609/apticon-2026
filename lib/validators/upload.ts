import { z } from "zod";

export const UPLOAD_ABSTRACT_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const UPLOAD_PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const UPLOAD_PURPOSES = [
  "abstract",
  "photo",
  "graphicalAbstract",
  "institutionalLetter",
] as const;
export type UploadPurpose = (typeof UPLOAD_PURPOSES)[number];

/** Per-purpose limits, kept beside the accepted types so the API and UI can't drift apart. */
export const UPLOAD_RULES: Record<
  UploadPurpose,
  { types: readonly string[]; maxBytes: number; label: string }
> = {
  abstract: {
    types: UPLOAD_ABSTRACT_TYPES,
    maxBytes: 10 * 1024 * 1024,
    label: "DOC or DOCX",
  },
  photo: {
    types: UPLOAD_PHOTO_TYPES,
    maxBytes: 5 * 1024 * 1024,
    label: "JPG, PNG or WebP",
  },
  graphicalAbstract: {
    types: UPLOAD_PHOTO_TYPES,
    maxBytes: 5 * 1024 * 1024,
    label: "JPG, PNG or WebP",
  },
  // Matches the aptiindia.org membership form's own limit (JPG/PNG, max 2MB).
  institutionalLetter: {
    types: UPLOAD_PHOTO_TYPES,
    maxBytes: 2 * 1024 * 1024,
    label: "JPG or PNG",
  },
};

export const uploadRequestSchema = z.object({
  purpose: z.enum(UPLOAD_PURPOSES).default("abstract"),
});

export type UploadRequestInput = z.infer<typeof uploadRequestSchema>;
