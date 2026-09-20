"use client";

import { useEffect, useRef, useState } from "react";
import { Download, ImagePlus, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";

const WIDTH = 1080;
const HEIGHT = 1350;
const PHOTO = { x: 40, y: 460, width: 476, height: 484, radius: 44 };
const NAME_AREA = { x: 40, y: 963, width: 1000, height: 256, radius: 44 };

type FormState = { name: string; designation: string; organization: string; email: string; mobile: string };

function roundedPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, start: number) {
  let size = start;
  while (size > 24) {
    ctx.font = `800 ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 1;
  }
  return size;
}

export default function WpdClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundRef = useRef<HTMLImageElement | null>(null);
  const photoRef = useRef<HTMLImageElement | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", designation: "", organization: "", email: "", mobile: "" });

  const draw = () => {
    const canvas = canvasRef.current;
    const background = backgroundRef.current;
    if (!canvas || !background?.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.drawImage(background, 0, 0, WIDTH, HEIGHT);

    // Keep the editable name/designation panel clean when the template has blank fields.
    ctx.save();
    roundedPath(ctx, NAME_AREA.x, NAME_AREA.y, NAME_AREA.width, NAME_AREA.height, NAME_AREA.radius);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundedPath(ctx, PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height, PHOTO.radius);
    ctx.clip();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height);
    const photo = photoRef.current;
    if (photo?.complete && photo.naturalWidth) {
      const scale = Math.max(PHOTO.width / photo.naturalWidth, PHOTO.height / photo.naturalHeight);
      const w = photo.naturalWidth * scale;
      const h = photo.naturalHeight * scale;
      ctx.drawImage(photo, PHOTO.x + (PHOTO.width - w) / 2, PHOTO.y + (PHOTO.height - h) / 2, w, h);
    }
    ctx.restore();
    ctx.save();
    roundedPath(ctx, PHOTO.x, PHOTO.y, PHOTO.width, PHOTO.height, PHOTO.radius);
    ctx.strokeStyle = "#32c9f1";
    ctx.lineWidth = 7;
    ctx.stroke();
    ctx.restore();

    const name = form.name.trim() || "Your Name";
    const designation = form.designation.trim() || "Your Designation";
    const organization = form.organization.trim() || "Your Organization";
    const nameSize = fitText(ctx, name, 900, 54);
    ctx.fillStyle = "#123b83";
    ctx.font = `800 ${nameSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(name, WIDTH / 2, 1080);
    ctx.fillStyle = "#173d89";
    ctx.font = "400 30px Arial, sans-serif";
    ctx.fillText(designation, WIDTH / 2, 1125);
    ctx.fillStyle = "#173d89";
    ctx.font = `400 ${fitText(ctx, organization, 900, 28)}px Arial, sans-serif`;
    ctx.fillText(organization, WIDTH / 2, 1170);
    ctx.textAlign = "start";

    if (!saved) {
      ctx.save();
      ctx.translate(WIDTH / 2, HEIGHT / 2);
      ctx.rotate(-Math.PI / 7);
      ctx.fillStyle = "rgba(18, 59, 131, 0.18)";
      ctx.font = "800 58px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("PREVIEW • SAVE DETAILS TO DOWNLOAD", 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    const image = new Image();
    image.src = "/WPD.png";
    image.onload = () => { backgroundRef.current = image; draw(); };
  }, []);

  useEffect(() => { draw(); }, [form, photoPreview, saved]);

  const update = (key: keyof FormState, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return setError("Please select a JPG, PNG or WebP photo.");
    if (file.size > 5 * 1024 * 1024) return setError("Photo must be 5 MB or smaller.");
    setError("");
    setSaved(false);
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
    const image = new Image();
    image.onload = () => { photoRef.current = image; draw(); };
    image.src = url;
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `WPD-2026-${form.name.trim().replace(/\s+/g, "-") || "post"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const savePost = async () => {
    setError("");
    if (!photoFile) return setError("Please upload your photo.");
    if (!form.name || !form.designation || !form.organization || !form.email || !form.mobile) return setError("Please complete all required fields.");
    setSaving(true);
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("photo", photoFile);
    const response = await fetch("/api/wpd-posts", { method: "POST", body: data });
    const body = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return setError(body.error ?? "Could not save your post.");
    setSaved(true);
  };

  return (
    <main className="min-h-screen bg-[var(--surface-50)] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent-500)]">World Pharmacists Day 2026</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-[var(--primary-800)] sm:text-5xl">Create your social post</h1>
          <p className="mt-4 text-[var(--muted-text)]">Add your details and photo. Your information is saved securely so the post can be generated again if needed.</p>
        </div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <section className="rounded-2xl border border-[var(--primary-800)]/10 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              {([['name','Full name'],['designation','Designation'],['organization','Organization'],['email','Email address'],['mobile','Mobile number']] as const).map(([key, label]) => (
                <label key={key} className="block text-sm font-semibold text-[var(--dark-text)]">
                  {label} <span className="text-red-500">*</span>
                  <input value={form[key]} onChange={(event) => update(key, event.target.value)} type={key === "email" ? "email" : key === "mobile" ? "tel" : "text"} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 font-normal outline-none transition focus:border-[var(--primary-700)] focus:ring-2 focus:ring-[var(--primary-700)]/15" required />
                </label>
              ))}
              <label className="block text-sm font-semibold text-[var(--dark-text)]">Your photo <span className="text-red-500">*</span>
                <input onChange={(event) => selectPhoto(event.target.files?.[0])} type="file" accept="image/jpeg,image/png,image/webp" className="mt-1.5 block w-full rounded-lg border border-dashed border-slate-300 p-3 text-sm font-normal file:mr-3 file:rounded-md file:border-0 file:bg-[var(--primary-800)] file:px-3 file:py-2 file:text-white" required />
              </label>
            </div>
            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {saved && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">Your post details have been saved.</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={savePost} disabled={saving}>{saving ? <Loader2 className="animate-spin" /> : <Save />} Save details</Button>
              {saved && <Button onClick={download} variant="outline"><Download /> Download PNG</Button>}
            </div>
          </section>
          <section className="rounded-2xl border border-[var(--primary-800)]/10 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-2xl font-bold text-[var(--primary-800)]">Live preview</h2><p className="text-sm text-[var(--muted-text)]">This is exactly what will be downloaded.</p></div><ImagePlus className="text-[var(--accent-500)]" /></div>
            <div className="mx-auto max-w-[650px] overflow-hidden rounded-xl bg-slate-100 shadow-lg"><canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="block h-auto w-full" /></div>
          </section>
        </div>
      </div>
    </main>
  );
}
