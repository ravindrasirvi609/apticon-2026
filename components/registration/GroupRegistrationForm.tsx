"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Info, Calculator, ShieldCheck, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import PhotoUploadField from "@/components/registration/PhotoUploadField";
import {
  REGISTRATION_CATEGORIES,
  GST_RATE,
  GROUP_COMPLIMENTARY_AT,
  calculateFeeWithGst,
  currentGroupFeeAmount,
  formatRupees,
  type RegistrationCategory,
} from "@/lib/registration-fees";
import { GROUP_MIN_DELEGATES, GROUP_MAX_DELEGATES } from "@/lib/validators/group-registration";
import PaymentRedirectDialog from "@/components/registration/PaymentRedirectDialog";

interface DelegateRow {
  name: string;
  designation: string;
  email: string;
  phone: string;
}

interface FormData {
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  institution: string;
  city: string;
  state: string;
  category: RegistrationCategory | "";
  delegates: DelegateRow[];
}

const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

const EMPTY_DELEGATE: DelegateRow = { name: "", designation: "", email: "", phone: "" };

type RazorpayResponse = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
type RazorpayOptions = {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  prefill: { name: string; email: string; contact: string }; theme: { color: string };
  modal: { ondismiss: () => void }; handler: (response: RazorpayResponse) => void;
};

declare global {
  interface Window { Razorpay?: new (options: RazorpayOptions) => { open: () => void; on: (event: string, callback: () => void) => void }; }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) { existing.addEventListener("load", () => resolve(), { once: true }); existing.addEventListener("error", () => reject(new Error("Could not load Razorpay")), { once: true }); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay"));
    document.body.appendChild(script);
  });
}

export default function GroupRegistrationForm() {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [redirectingToConfirmation, setRedirectingToConfirmation] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null);
  const [photos, setPhotos] = useState<(File | null)[]>(Array.from({ length: GROUP_MIN_DELEGATES }, () => null));
  const [photoErrors, setPhotoErrors] = useState<Record<number, string>>({});

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { delegates: Array.from({ length: GROUP_MIN_DELEGATES }, () => ({ ...EMPTY_DELEGATE })) },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "delegates" });

  const category = watch("category");
  const chosenCategory: RegistrationCategory | null = category && REGISTRATION_CATEGORIES.includes(category as RegistrationCategory)
    ? (category as RegistrationCategory)
    : null;
  const delegateCount = fields.length;
  const groupFee = chosenCategory ? currentGroupFeeAmount(chosenCategory, delegateCount) : null;
  const feeBreakdown = groupFee ? calculateFeeWithGst(groupFee.baseAmount) : null;

  function addDelegate() {
    if (fields.length >= GROUP_MAX_DELEGATES) {
      toast.error(`A single group registration supports up to ${GROUP_MAX_DELEGATES} delegates.`);
      return;
    }
    append({ ...EMPTY_DELEGATE });
    setPhotos((p) => [...p, null]);
  }

  function removeDelegate(index: number) {
    if (fields.length <= GROUP_MIN_DELEGATES) {
      toast.error(`A group registration needs at least ${GROUP_MIN_DELEGATES} delegates.`);
      return;
    }
    remove(index);
    setPhotos((p) => p.filter((_, i) => i !== index));
  }

  async function uploadPhoto(file: File): Promise<string | null> {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("purpose", "photo");
    const res = await fetch("/api/upload", { method: "POST", body: payload });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error ?? "A delegate photo upload failed. Please try again.");
      return null;
    }
    return (body as { key: string }).key;
  }

  const onSubmit = async (data: FormData) => {
    const missingPhoto = photos.findIndex((p) => !p);
    if (missingPhoto !== -1) {
      setPhotoErrors({ [missingPhoto]: "A profile photo is required." });
      toast.error(`Delegate #${missingPhoto + 1} is missing a profile photo.`);
      return;
    }
    setPhotoErrors({});

    setUploading(true);
    setUploadProgress({ done: 0, total: photos.length });
    const uploaded: { key: string; name: string }[] = [];
    for (let i = 0; i < photos.length; i++) {
      const key = await uploadPhoto(photos[i]!);
      if (!key) { setUploading(false); setUploadProgress(null); return; }
      uploaded.push({ key, name: photos[i]!.name });
      setUploadProgress({ done: i + 1, total: photos.length });
    }
    setUploading(false);
    setUploadProgress(null);

    setPaying(true);
    const res = await fetch("/api/payments/razorpay/group-order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        coordinatorName: data.coordinatorName,
        coordinatorEmail: data.coordinatorEmail,
        coordinatorPhone: data.coordinatorPhone,
        institution: data.institution,
        city: data.city || undefined,
        state: data.state || undefined,
        category: data.category,
        delegates: data.delegates.map((d, i) => ({
          name: d.name,
          designation: d.designation,
          email: d.email,
          phone: d.phone,
          photoKey: uploaded[i].key,
          photoName: uploaded[i].name,
        })),
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Group registration failed. Please try again.");
      setPaying(false);
      return;
    }
    try {
      await loadRazorpayCheckout();
      if (!window.Razorpay) throw new Error("Razorpay did not load");
      const checkout = new window.Razorpay({
        key: body.key,
        amount: body.amount,
        currency: body.currency,
        name: "APTICON 2026",
        description: `Group Registration ${body.groupCode}`,
        order_id: body.orderId,
        prefill: { name: data.coordinatorName, email: data.coordinatorEmail, contact: data.coordinatorPhone },
        theme: { color: "#8f1737" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
          setRedirectingToConfirmation(true);
          try {
            const verify = await fetch("/api/payments/razorpay/group-verify", {
              method: "POST", headers: { "content-type": "application/json" },
              body: JSON.stringify({ groupRegistrationId: body.groupRegistrationId, ...response }),
            });
            const result = await verify.json();
            if (!verify.ok) throw new Error(result.error ?? "Payment verification failed");
            toast.success("Payment confirmed. Your group registration is pending confirmation.");
            router.push(`/registration/group/success/${result.groupCode}?payment=${result.captured ? "confirmed" : "processing"}`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed. It will be checked automatically.");
            router.push(`/registration/group/success/${body.groupCode}?payment=processing`);
          } finally { setPaying(false); }
        },
      });
      checkout.on("payment.failed", () => { setPaying(false); toast.error("Payment was not completed. You can try again."); });
      checkout.open();
    } catch (error) {
      setPaying(false);
      toast.error(error instanceof Error ? error.message : "Unable to open secure payment.");
    }
  };

  const errCls = "mt-1 text-xs text-red-600";
  const busy = isSubmitting || paying || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <PaymentRedirectDialog open={redirectingToConfirmation} />

      {/* Coordinator */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Coordinator Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="coordinatorName">Coordinator Name *</Label>
            <Input id="coordinatorName" className="mt-2" {...register("coordinatorName", { required: "Coordinator name is required", minLength: 2 })} />
            {errors.coordinatorName && <p className={errCls}>{errors.coordinatorName.message}</p>}
          </div>
          <div>
            <Label htmlFor="coordinatorPhone">Coordinator Mobile *</Label>
            <Input
              id="coordinatorPhone" type="tel" inputMode="numeric" maxLength={10} className="mt-2"
              placeholder="10-digit mobile"
              {...register("coordinatorPhone", { required: "Mobile is required", pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" } })}
              onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, "").slice(0, 10); }}
            />
            {errors.coordinatorPhone && <p className={errCls}>{errors.coordinatorPhone.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="coordinatorEmail">Coordinator Email *</Label>
            <Input id="coordinatorEmail" type="email" className="mt-2" placeholder="you@example.com"
              {...register("coordinatorEmail", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" } })}
            />
            {errors.coordinatorEmail && <p className={errCls}>{errors.coordinatorEmail.message}</p>}
            <p className="mt-1 text-xs text-[var(--muted-text)]">Payment receipt and group confirmation are sent here.</p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="institution">Institution / College *</Label>
            <Input id="institution" className="mt-2" placeholder="Full name of institution" {...register("institution", { required: "Institution is required" })} />
            {errors.institution && <p className={errCls}>{errors.institution.message}</p>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-2" placeholder="City" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <select id="state" className="mt-2 flex h-10 w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]" {...register("state")} defaultValue="">
              <option value="">Select State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Category + Fee */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Group Category &amp; Fee
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category (applies to whole group) *</Label>
            <select id="category" className="mt-2 flex h-10 w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]" {...register("category", { required: "Please select a category" })} defaultValue="">
              <option value="">Select Category</option>
              {REGISTRATION_CATEGORIES.filter((c) => c !== "Accompanying Person" && c !== "APTI Membership + APTICON Registration").map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className={errCls}>{errors.category.message}</p>}
          </div>
          <div>
            <Label>Fee Calculator</Label>
            <div className="mt-2 min-h-10 px-3 py-2.5 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25">
              {groupFee && feeBreakdown ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">{delegateCount} delegates × {formatRupees(groupFee.perHead)}</span>
                    <span>{formatRupees(groupFee.perHead * delegateCount)}</span>
                  </div>
                  {groupFee.complimentaryCount > 0 && (
                    <div className="flex items-center justify-between gap-3 text-emerald-700">
                      <span>− {groupFee.complimentaryCount} complimentary</span>
                      <span>−{formatRupees(groupFee.perHead * groupFee.complimentaryCount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">GST ({GST_RATE * 100}%)</span>
                    <span>{formatRupees(feeBreakdown.gstAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--gold-500)]/25 pt-1 font-semibold">
                    <span className="inline-flex items-center gap-1 text-[var(--dark-text)]"><Calculator className="h-3.5 w-3.5" /> Total payable</span>
                    <b className="text-[var(--crimson-800)]">{formatRupees(feeBreakdown.totalAmount)}</b>
                  </div>
                  <span className="block text-[10px] text-[var(--muted-text)] uppercase tracking-wider">{groupFee.tier.replace("_", " ")} · {groupFee.paidCount} payable</span>
                </div>
              ) : (
                <span className="text-sm text-[var(--muted-text)]/70">Select a category to see the fee</span>
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-[var(--muted-text)]">
          <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Groups of {GROUP_COMPLIMENTARY_AT} or more get 1 complimentary seat automatically — the total above already
            reflects it. All delegates in a group share one fee category.
          </span>
        </div>
      </div>

      {/* Delegates */}
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          <h3 className="font-display font-bold text-lg text-[var(--dark-text)] flex items-center gap-2">
            <Users className="w-4.5 h-4.5" /> Delegates ({delegateCount})
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addDelegate} disabled={busy}>
            <Plus className="w-4 h-4" /> Add Delegate
          </Button>
        </div>

        <div className="space-y-5">
          {fields.map((field, index) => (
            <div key={field.id} className="rounded-xl border border-[var(--gold-500)]/20 p-4 bg-[var(--cream-50)]/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
                  Delegate #{index + 1}{index >= delegateCount - (groupFee?.complimentaryCount ?? 0) && (groupFee?.complimentaryCount ?? 0) > 0 ? " · Complimentary" : ""}
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeDelegate(index)} disabled={busy || fields.length <= GROUP_MIN_DELEGATES}>
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor={`delegates.${index}.name`}>Full Name *</Label>
                  <Input id={`delegates.${index}.name`} className="mt-1.5" {...register(`delegates.${index}.name`, { required: true, minLength: 2 })} />
                  {errors.delegates?.[index]?.name && <p className={errCls}>Required.</p>}
                </div>
                <div>
                  <Label htmlFor={`delegates.${index}.designation`}>Designation *</Label>
                  <Input id={`delegates.${index}.designation`} className="mt-1.5" {...register(`delegates.${index}.designation`, { required: true, minLength: 2 })} />
                  {errors.delegates?.[index]?.designation && <p className={errCls}>Required.</p>}
                </div>
                <div>
                  <Label htmlFor={`delegates.${index}.email`}>Email *</Label>
                  <Input id={`delegates.${index}.email`} type="email" className="mt-1.5" {...register(`delegates.${index}.email`, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                  {errors.delegates?.[index]?.email && <p className={errCls}>Valid email required.</p>}
                </div>
                <div>
                  <Label htmlFor={`delegates.${index}.phone`}>Mobile *</Label>
                  <Input
                    id={`delegates.${index}.phone`} type="tel" inputMode="numeric" maxLength={10} className="mt-1.5"
                    {...register(`delegates.${index}.phone`, { required: true, pattern: /^[6-9]\d{9}$/ })}
                    onInput={(e) => { const t = e.currentTarget; t.value = t.value.replace(/\D/g, "").slice(0, 10); }}
                  />
                  {errors.delegates?.[index]?.phone && <p className={errCls}>Valid 10-digit mobile required.</p>}
                </div>
                <div className="sm:col-span-2">
                  <PhotoUploadField
                    file={photos[index] ?? null}
                    onChange={(f) => setPhotos((p) => { const next = [...p]; next[index] = f; return next; })}
                    error={photoErrors[index]}
                    disabled={busy}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Secure Online Payment
        </h3>
        <div className="mb-4 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/20 p-4 text-sm">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-[var(--crimson-800)] flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--dark-text)] mb-1">One payment for the whole group</p>
              <p className="text-[var(--muted-text)]">
                After you submit, Razorpay will open its secure checkout for the discounted group total. Your group
                will be reviewed by our team and confirmed shortly after payment — each delegate receives their own
                registration code and QR badge by email once confirmed.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading
                ? `Uploading photos… ${uploadProgress ? `(${uploadProgress.done}/${uploadProgress.total})` : ""}`
                : paying ? "Opening secure payment…" : "Preparing payment…"}
            </>
          ) : "Continue to Secure Group Payment"}
        </Button>
        <p className="mt-3 text-center text-xs text-[var(--muted-text)]">
          Your group registration will be confirmed after payment and a quick review by our team.
        </p>
      </div>
    </form>
  );
}
