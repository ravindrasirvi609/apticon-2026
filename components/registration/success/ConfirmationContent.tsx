"use client";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import type { BadgeData } from "./types";

interface Props {
  badge: BadgeData;
  qrDataUrl: string;
}

export default function ConfirmationContent({ badge, qrDataUrl }: Props) {
  const { confirmed, fullName, registrationCode } = badge;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="text-center max-w-lg mx-auto"
    >
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-[var(--crimson-800)] mb-2">
        {confirmed ? "Registration Complete!" : "Payment Processing"}
      </h1>
      <p className="text-[var(--muted-text)]">
        {confirmed
          ? "Your account has been successfully created."
          : "Your payment is being confirmed automatically by Razorpay."}
      </p>

      <p className="mt-4 font-display text-xl text-[var(--dark-text)]">
        Welcome, {fullName}!
      </p>
      <p className="text-sm text-[var(--muted-text)]">
        {confirmed
          ? "Your registration is confirmed and your digital ID is ready."
          : "We'll confirm automatically the moment Razorpay clears the payment."}
      </p>

      <div className="mt-6 rounded-xl border border-[var(--gold-500)]/30 bg-[var(--cream-100)] p-5">
        <div className="text-xs font-semibold tracking-widest uppercase text-[var(--muted-text)]">
          Your Registration Code
        </div>
        <div className="mt-1 font-mono text-2xl font-black text-[var(--crimson-800)]">
          {registrationCode}
        </div>
        <div className="mt-4 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="QR code encoding your registration code"
            width={140}
            height={140}
            className="rounded-lg border border-[var(--gold-500)]/20 bg-white p-2"
          />
          <p className="text-xs text-[var(--muted-text)]">Scan this at the registration desk</p>
        </div>
      </div>

      <div
        className={`mt-6 p-4 rounded-lg text-sm text-left ${
          confirmed
            ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
            : "bg-amber-50 border border-amber-200 text-amber-900"
        }`}
      >
        <b>What happens next?</b>
        <ol className="mt-2 space-y-1 list-decimal list-inside">
          <li>
            {confirmed
              ? "Your payment and registration are complete."
              : "Razorpay will confirm the payment automatically; this normally takes only a moment."}
          </li>
          <li>You&apos;ll receive a confirmation email when payment capture completes.</li>
          <li>Bring your registration code to the venue for kit collection.</li>
        </ol>
      </div>
    </motion.div>
  );
}
