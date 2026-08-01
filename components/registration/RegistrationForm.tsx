"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Info, Calculator, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import PhotoUploadField from "@/components/registration/PhotoUploadField";
import {
  REGISTRATION_CATEGORIES,
  FEE_TABLE,
  GST_RATE,
  calculateFeeWithGst,
  currentFeeAmount,
  formatRupees,
  type RegistrationCategory,
} from "@/lib/registration-fees";

interface FormData {
  fullName: string;
  designation: string;
  institution: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  category: RegistrationCategory | "";
  willSubmitAbstract: boolean;
  remarks: string;
}

const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

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

export default function RegistrationForm() {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { willSubmitAbstract: false },
  });

  const category = watch("category");
  const chosenCategory: RegistrationCategory | null = category && REGISTRATION_CATEGORIES.includes(category as RegistrationCategory)
    ? (category as RegistrationCategory)
    : null;
  const currentFee = chosenCategory ? currentFeeAmount(chosenCategory) : null;
  const feeBreakdown = currentFee ? calculateFeeWithGst(currentFee.amount) : null;

  /** Uploads the photo and returns its storage key, or null if the upload failed. */
  async function uploadPhoto(file: File): Promise<string | null> {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("purpose", "photo");
    const res = await fetch("/api/upload", { method: "POST", body: payload });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error ?? "Photo upload failed. Please try again.");
      return null;
    }
    return (body as { key: string }).key;
  }

  const onSubmit = async (data: FormData) => {
    if (!photo) {
      setPhotoError("A profile photo is required.");
      toast.error("Please upload a profile photo.");
      return;
    }
    setPhotoError(null);

    // Upload first — no point creating an order we'd have to discard.
    setUploading(true);
    const photoKey = await uploadPhoto(photo);
    setUploading(false);
    if (!photoKey) return;

    setPaying(true);
    const res = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: data.fullName,
        designation: data.designation,
        institution: data.institution,
        city: data.city || undefined,
        state: data.state || undefined,
        email: data.email,
        phone: data.phone,
        photoKey,
        photoName: photo.name,
        category: data.category,
        willSubmitAbstract: !!data.willSubmitAbstract,
        remarks: data.remarks || undefined,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Registration failed. Please try again.");
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
        description: `Registration ${body.registrationCode}`,
        order_id: body.orderId,
        prefill: { name: data.fullName, email: data.email, contact: data.phone },
        theme: { color: "#8f1737" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
          try {
            const verify = await fetch("/api/payments/razorpay/verify", {
              method: "POST", headers: { "content-type": "application/json" },
              body: JSON.stringify({ registrationId: body.registrationId, ...response }),
            });
            const result = await verify.json();
            if (!verify.ok) throw new Error(result.error ?? "Payment verification failed");
            toast.success(result.captured ? "Payment confirmed. Your registration is complete." : "Payment verified and is being confirmed.");
            router.push(`/registration/success/${result.registrationCode}?payment=${result.captured ? "confirmed" : "processing"}`);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Payment verification failed. It will be checked automatically.");
            router.push(`/registration/success/${body.registrationCode}?payment=processing`);
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">

      {/* Personal Info */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <PhotoUploadField
              file={photo}
              onChange={(f) => { setPhoto(f); if (f) setPhotoError(null); }}
              error={photoError ?? undefined}
              disabled={uploading || paying}
            />
          </div>
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              className="mt-2"
              placeholder="Dr. / Mr. / Ms. Full Name"
              {...register("fullName", { required: "Full name is required", minLength: 2 })}
            />
            {errors.fullName && <p className={errCls}>{errors.fullName.message}</p>}
          </div>
          <div>
            <Label htmlFor="designation">Designation *</Label>
            <Input
              id="designation"
              className="mt-2"
              placeholder="Professor / Associate Professor / Student"
              {...register("designation", { required: "Designation is required" })}
            />
            {errors.designation && <p className={errCls}>{errors.designation.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="institution">Institution / College *</Label>
            <Input
              id="institution"
              className="mt-2"
              placeholder="Full name of institution"
              {...register("institution", { required: "Institution is required" })}
            />
            {errors.institution && <p className={errCls}>{errors.institution.message}</p>}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" className="mt-2" placeholder="City" {...register("city")} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              className="mt-2 flex h-10 w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]"
              {...register("state")}
              defaultValue=""
            >
              <option value="">Select State</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              className="mt-2"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              })}
            />
            {errors.email && <p className={errCls}>{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Mobile *</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              className="mt-2"
              placeholder="10-digit mobile"
              {...register("phone", {
                required: "Mobile is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit Indian mobile number" },
              })}
              onInput={(e) => {
                // Strip non-digits and cap at 10 as the user types
                const t = e.currentTarget;
                t.value = t.value.replace(/\D/g, "").slice(0, 10);
              }}
            />
            {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Category + Fee */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Registration Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              className="mt-2 flex h-10 w-full rounded-lg border border-[var(--gold-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)]"
              {...register("category", { required: "Please select a category" })}
              defaultValue=""
            >
              <option value="">Select Category</option>
              {REGISTRATION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className={errCls}>{errors.category.message}</p>}
          </div>
          <div>
            <Label>Fee Calculator</Label>
            <div className="mt-2 min-h-10 px-3 py-2.5 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25">
              {currentFee && feeBreakdown ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">Registration fee</span>
                    <span>{formatRupees(currentFee.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">GST ({GST_RATE * 100}%)</span>
                    <span>{formatRupees(feeBreakdown.gstAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--gold-500)]/25 pt-1 font-semibold">
                    <span className="inline-flex items-center gap-1 text-[var(--dark-text)]"><Calculator className="h-3.5 w-3.5" /> Total payable</span>
                    <b className="text-[var(--crimson-800)]">{formatRupees(feeBreakdown.totalAmount)}</b>
                  </div>
                  <span className="block text-[10px] text-[var(--muted-text)] uppercase tracking-wider">{currentFee.tier.replace("_", " ")}</span>
                </div>
              ) : (
                <span className="text-sm text-[var(--muted-text)]/70">Select a category to see the fee</span>
              )}
            </div>
          </div>
        </div>
        {chosenCategory && (
          <div className="mt-3 flex items-start gap-2 text-xs text-[var(--muted-text)]">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Fees are auto-selected based on today&apos;s date; GST is calculated at 18% extra. Base-fee tiers for this category:
              early bird {formatRupees(FEE_TABLE[chosenCategory].early_bird)} · regular {formatRupees(FEE_TABLE[chosenCategory].regular)} · on-spot {formatRupees(FEE_TABLE[chosenCategory].on_spot)}.
            </span>
          </div>
        )}
        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-[var(--cream-50)] border border-[var(--gold-500)]/20">
          <input
            type="checkbox"
            id="abstract"
            {...register("willSubmitAbstract")}
            className="mt-0.5 w-4 h-4 accent-[var(--crimson-800)] cursor-pointer"
          />
          <label htmlFor="abstract" className="text-sm text-[var(--dark-text)] cursor-pointer">
            I intend to submit an abstract (review or research article).
            <span className="block text-xs text-[var(--muted-text)] mt-0.5">
              You&apos;ll submit the abstract separately on the <a href="/abstracts" className="text-[var(--crimson-800)] hover:underline">Abstracts page</a>. Registration and abstract will be linked automatically by your email.
            </span>
          </label>
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
              <p className="font-semibold text-[var(--dark-text)] mb-1">Pay securely with Razorpay</p>
              <p className="text-[var(--muted-text)]">
                After you submit this form, Razorpay will open its secure checkout. You can pay using UPI, cards, net banking, or any method enabled by the organiser. Your registration is confirmed automatically only after payment is captured.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <Label htmlFor="remarks">Remarks / Queries</Label>
        <Textarea
          id="remarks"
          className="mt-2 resize-none"
          rows={3}
          placeholder="Dietary restrictions, accessibility needs, or queries…"
          {...register("remarks")}
        />
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || paying || uploading}
        >
          {(paying || uploading || isSubmitting) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading ? "Uploading photo…" : paying ? "Opening secure payment…" : "Preparing payment…"}
            </>
          ) : "Continue to Secure Payment"}
        </Button>
        <p className="mt-3 text-center text-xs text-[var(--muted-text)]">
          No manual payment proof is required. Your registration confirmation is emailed automatically after Razorpay confirms the payment.
        </p>
      </div>
    </form>
  );
}
