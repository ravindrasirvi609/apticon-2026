import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID ?? "";
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "";
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "";
const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "";
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "";

export const R2_BUCKET = BUCKET;
export const R2_PUBLIC_URL = PUBLIC_URL;

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

export function buildAbstractKey(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = ["pdf", "doc", "docx"].includes(ext) ? ext : "bin";
  return `abstracts/${new Date().getUTCFullYear()}/${nanoid(16)}.${safeExt}`;
}

export function buildPaymentProofKey(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = ["pdf", "jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "bin";
  return `payment-proofs/${new Date().getUTCFullYear()}/${nanoid(16)}.${safeExt}`;
}

export async function presignUpload(key: string, contentType: string, expiresSec = 300): Promise<string> {
  const cmd = new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType });
  return getSignedUrl(r2, cmd, { expiresIn: expiresSec });
}

export function publicUrl(key: string): string {
  return `${PUBLIC_URL.replace(/\/$/, "")}/${key}`;
}

export async function uploadBuffer(key: string, body: Buffer, contentType: string): Promise<string> {
  await r2.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType }));
  return publicUrl(key);
}

export async function deleteObject(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
