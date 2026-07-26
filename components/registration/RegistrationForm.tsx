"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { scaleIn } from "@/lib/animations";

interface FormData {
  fullName: string;
  designation: string;
  institution: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  whatsapp: string;
  category: string;
  abstractSubmission: boolean;
  paymentMode: string;
  remarks: string;
}

const CATEGORIES = [
  "APTI Life Member",
  "APTI Annual Member",
  "Non-Member",
  "PG Student / Research Scholar",
  "UG Student",
  "Accompanying Person",
];

const STATES = ["Andhra Pradesh","Chhattisgarh","Delhi","Gujarat","Karnataka","Madhya Pradesh","Maharashtra","Odisha","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal","Other"];

export default function RegistrationForm() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  const inputCls = (hasError?: boolean) => `
    w-full px-4 py-3 rounded-xl border text-sm text-[var(--dark-text)] bg-white
    placeholder:text-[var(--muted-text)]/60
    focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:border-transparent
    transition-all duration-200
    ${hasError ? "border-red-400 bg-red-50" : "border-[var(--gold-500)]/25 hover:border-[var(--gold-500)]/60"}
  `;

  if (submitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={scaleIn}
        className="py-16 text-center"
      >
        <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
        <h3 className="font-display font-bold text-2xl text-[var(--dark-text)] mb-2">Registration Submitted!</h3>
        <p className="text-[var(--muted-text)] max-w-md mx-auto mb-6">
          Thank you for registering for APTICON 2026. A confirmation will be sent to your email after payment verification.
        </p>
        <p className="text-sm font-medium text-[var(--crimson-800)]">For queries: apticon2026@gmail.com</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* Personal Info */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("fullName", { required: "Full name is required" })}
              placeholder="Dr. / Mr. / Ms. Full Name"
              className={inputCls(!!errors.fullName)}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
              Designation <span className="text-red-500">*</span>
            </label>
            <input
              {...register("designation", { required: "Designation is required" })}
              placeholder="Professor / Associate Professor / Student"
              className={inputCls(!!errors.designation)}
            />
            {errors.designation && <p className="mt-1 text-xs text-red-500">{errors.designation.message}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
              Institution / College <span className="text-red-500">*</span>
            </label>
            <input
              {...register("institution", { required: "Institution is required" })}
              placeholder="Full name of institution"
              className={inputCls(!!errors.institution)}
            />
            {errors.institution && <p className="mt-1 text-xs text-red-500">{errors.institution.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">City</label>
            <input {...register("city")} placeholder="City" className={inputCls()} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">State</label>
            <select {...register("state")} className={inputCls()}>
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
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              })}
              placeholder="you@example.com"
              className={inputCls(!!errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
              Mobile <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              {...register("phone", {
                required: "Mobile is required",
                pattern: { value: /^[6-9]\d{9}$/, message: "Enter valid 10-digit number" },
              })}
              placeholder="10-digit mobile"
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">WhatsApp</label>
            <input type="tel" {...register("whatsapp")} placeholder="WhatsApp number" className={inputCls()} />
          </div>
        </div>
      </div>

      {/* Registration Category */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Registration Category
        </h3>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            {...register("category", { required: "Please select a category" })}
            className={inputCls(!!errors.category)}
          >
            <option value="">Select Registration Category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
        </div>
        <div className="mt-4 flex items-start gap-3">
          <input
            type="checkbox"
            id="abstract"
            {...register("abstractSubmission")}
            className="mt-0.5 w-4 h-4 accent-[var(--crimson-800)] cursor-pointer"
          />
          <label htmlFor="abstract" className="text-sm text-[var(--muted-text)] cursor-pointer">
            I will be submitting an abstract for poster / oral presentation
          </label>
        </div>
      </div>

      {/* Payment */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--gold-500)]/20">
          Payment Mode
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {["NEFT / RTGS Bank Transfer", "UPI Payment", "Demand Draft", "Online (Registration Portal)"].map((mode) => (
            <label key={mode} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--gold-500)]/20 cursor-pointer hover:border-[var(--gold-500)]/60 transition-colors">
              <input type="radio" value={mode} {...register("paymentMode", { required: "Select payment mode" })} className="accent-[var(--crimson-800)]" />
              <span className="text-sm text-[var(--dark-text)]">{mode}</span>
            </label>
          ))}
        </div>
        {errors.paymentMode && <p className="text-xs text-red-500">{errors.paymentMode.message}</p>}
        <div className="rounded-xl bg-[var(--cream-100)] border border-[var(--gold-500)]/20 p-4 mt-4 text-sm text-[var(--muted-text)]">
          <p className="font-semibold text-[var(--dark-text)] mb-1">Bank Details (for NEFT/RTGS/DD):</p>
          <p>Account Name: APTI Chhattisgarh State Branch — APTICON 2026</p>
          <p className="mt-1 text-xs">Bank details will be provided upon email confirmation. Contact apticon2026@gmail.com</p>
        </div>
      </div>

      {/* Remarks */}
      <div>
        <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">Remarks / Queries</label>
        <textarea
          {...register("remarks")}
          rows={3}
          placeholder="Any dietary restrictions, accessibility needs, or queries..."
          className={`${inputCls()} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="
          w-full py-4 rounded-xl font-bold text-base tracking-wide
          bg-[var(--crimson-800)] text-white
          hover:bg-[var(--crimson-700)] disabled:opacity-60
          transition-all duration-200 shadow-md shadow-[var(--crimson-800)]/25
          focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2
        "
      >
        {isSubmitting ? "Submitting…" : "Submit Registration"}
      </button>
      <p className="text-center text-xs text-[var(--muted-text)]">
        For registration assistance, contact{" "}
        <a href="mailto:apticon2026@gmail.com" className="text-[var(--crimson-800)] hover:underline">
          apticon2026@gmail.com
        </a>
      </p>
    </form>
  );
}
