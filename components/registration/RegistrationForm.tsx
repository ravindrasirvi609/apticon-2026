"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Upload, Loader2, CreditCard, Info } from "lucide-react";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Label } from "@/components/ui/shadcn/label";
import {
  REGISTRATION_CATEGORIES,
  FEE_TABLE,
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
  whatsapp: string;
  category: RegistrationCategory | "";
  willSubmitAbstract: boolean;
  paymentMode: "neft_rtgs" | "upi" | "dd" | "online" | "";
  transactionNumber: string;
  remarks: string;
}

const STATES = ["Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat","Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal","Other"];

const PAYMENT_MODES: { value: "neft_rtgs" | "upi" | "dd" | "online"; label: string; note: string }[] = [
  { value: "neft_rtgs", label: "NEFT / RTGS", note: "Bank transfer — enter UTR number" },
  { value: "upi",       label: "UPI",         note: "UPI transaction ID (e.g. 421...@paytm)" },
  { value: "dd",        label: "Demand Draft", note: "Draft number issued by the bank" },
  { value: "online",    label: "Online Portal", note: "Payment gateway reference / order ID" },
];

const PAYMENT_PROOF_TYPES: Record<string, "application/pdf" | "image/jpeg" | "image/png" | "image/webp"> = {
  pdf:  "application/pdf",
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
};

export default function RegistrationForm() {
  const router = useRouter();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: { willSubmitAbstract: false },
  });

  const category = watch("category");
  const chosenCategory: RegistrationCategory | null = category && REGISTRATION_CATEGORIES.includes(category as RegistrationCategory)
    ? (category as RegistrationCategory)
    : null;
  const currentFee = chosenCategory ? currentFeeAmount(chosenCategory) : null;

  async function uploadProof(f: File): Promise<{ key: string } | null> {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = PAYMENT_PROOF_TYPES[ext];
    if (!contentType) {
      toast.error("Payment proof must be PDF, JPG, PNG or WEBP.");
      return null;
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Payment proof must be under 5 MB.");
      return null;
    }
    const presignRes = await fetch("/api/upload/presign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: f.name,
        contentType,
        size: f.size,
        purpose: "payment_proof",
      }),
    });
    if (!presignRes.ok) {
      toast.error("Could not prepare upload.");
      return null;
    }
    const { uploadUrl, key } = (await presignRes.json()) as { uploadUrl: string; key: string };
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": contentType },
      body: f,
    });
    if (!putRes.ok) {
      toast.error("Payment proof upload failed.");
      return null;
    }
    return { key };
  }

  const onSubmit = async (data: FormData) => {
    if (!proofFile) {
      toast.error("Please attach your payment proof.");
      return;
    }
    setUploading(true);
    const uploaded = await uploadProof(proofFile);
    setUploading(false);
    if (!uploaded) return;

    const res = await fetch("/api/registrations", {
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
        whatsapp: data.whatsapp || undefined,
        category: data.category,
        willSubmitAbstract: !!data.willSubmitAbstract,
        paymentMode: data.paymentMode,
        transactionNumber: data.transactionNumber,
        paymentProofKey: uploaded.key,
        paymentProofName: proofFile.name,
        remarks: data.remarks || undefined,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      toast.error(body.error ?? "Registration failed. Please try again.");
      return;
    }
    toast.success("Registration received. Check your email.");
    router.push(`/registration/success/${body.registrationCode}`);
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="mt-2"
              placeholder="10-digit mobile"
              {...register("phone", {
                required: "Mobile is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit number" },
              })}
            />
            {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" type="tel" className="mt-2" placeholder="WhatsApp number" {...register("whatsapp")} />
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
            <Label>Applicable Fee</Label>
            <div className="mt-2 h-10 flex items-center px-3 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/25">
              {currentFee ? (
                <span className="text-sm">
                  <b className="text-[var(--crimson-800)]">{formatRupees(currentFee.amount)}</b>
                  <span className="ml-2 text-xs text-[var(--muted-text)] uppercase tracking-wider">{currentFee.tier.replace("_", " ")}</span>
                </span>
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
              This fee is auto-selected based on today's date. Full tier for this category:
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
            I intend to submit an abstract for poster/oral presentation.
            <span className="block text-xs text-[var(--muted-text)] mt-0.5">
              You'll submit the abstract separately on the <a href="/abstracts" className="text-[var(--crimson-800)] hover:underline">Abstracts page</a>. Registration and abstract will be linked automatically by your email.
            </span>
          </label>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Payment
        </h3>
        <div className="mb-4 rounded-lg bg-[var(--cream-100)] border border-[var(--gold-500)]/20 p-4 text-sm">
          <div className="flex items-start gap-2">
            <CreditCard className="w-4 h-4 mt-0.5 text-[var(--crimson-800)] flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--dark-text)] mb-1">Bank details for NEFT/RTGS/DD:</p>
              <p className="text-[var(--muted-text)]">
                Account Name: <b>APTI Chhattisgarh — APTICON 2026</b><br/>
                Contact <a href="mailto:apticon2026@gmail.com" className="text-[var(--crimson-800)] hover:underline">apticon2026@gmail.com</a> to receive full bank details, UPI QR code, and payment instructions before making the transfer.
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label>Payment Mode *</Label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYMENT_MODES.map((m) => (
              <label key={m.value} className="flex items-start gap-3 p-3 rounded-lg border border-[var(--gold-500)]/25 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40 transition-colors">
                <input
                  type="radio"
                  value={m.value}
                  {...register("paymentMode", { required: "Select a payment mode" })}
                  className="mt-1 accent-[var(--crimson-800)]"
                />
                <div>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-[var(--muted-text)] mt-0.5">{m.note}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.paymentMode && <p className={errCls}>{errors.paymentMode.message}</p>}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="transactionNumber">Transaction / Reference Number *</Label>
            <Input
              id="transactionNumber"
              className="mt-2 font-mono"
              placeholder="UTR / UPI ref / DD number"
              {...register("transactionNumber", { required: "Transaction number is required", minLength: 3 })}
            />
            {errors.transactionNumber && <p className={errCls}>{errors.transactionNumber.message}</p>}
          </div>
          <div>
            <Label>Payment Proof *</Label>
            <div className="mt-2 flex items-center gap-3">
              <label className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[var(--gold-500)]/40 bg-white cursor-pointer hover:border-[var(--crimson-800)]/40 transition-colors">
                <Upload className="w-4 h-4 text-[var(--muted-text)]" />
                <span className="text-sm text-[var(--dark-text)] truncate">
                  {proofFile ? proofFile.name : "Choose file (PDF/JPG/PNG, ≤5MB)…"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {proofFile && (
                <Button type="button" variant="outline" size="sm" onClick={() => setProofFile(null)}>Remove</Button>
              )}
            </div>
            <p className="mt-1 text-xs text-[var(--muted-text)]">Screenshot / receipt / DD photo. Approver will verify against your transaction number.</p>
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
          disabled={isSubmitting || uploading || !proofFile}
        >
          {(uploading || isSubmitting) ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading ? "Uploading proof…" : "Submitting…"}
            </>
          ) : "Submit Registration"}
        </Button>
        <p className="mt-3 text-center text-xs text-[var(--muted-text)]">
          You'll receive a confirmation email with your registration code. Once payment is verified, we'll email your final confirmation.
        </p>
      </div>
    </form>
  );
}
