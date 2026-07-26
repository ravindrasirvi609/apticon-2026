"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { Mail, MapPin, Calendar, CheckCircle } from "lucide-react";
import GoldenBadge from "@/components/ui/GoldenBadge";
import CulturalDivider from "@/components/ui/CulturalDivider";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { EVENT } from "@/lib/constants";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const CONTACTS = [
  { icon: Mail,    label: "General Enquiries", value: "apticon2026@gmail.com", href: "mailto:apticon2026@gmail.com" },
  { icon: MapPin,  label: "Venue",             value: "Pt. Deendayal Upadhyay Auditorium, G.E. Road, Raipur (C.G.)", href: null },
  { icon: Calendar,label: "Conference Dates",  value: "24th & 25th October 2026", href: null },
];

const SUBJECT_OPTIONS = [
  "Registration Query",
  "Abstract Submission",
  "Sponsorship / Exhibitor",
  "Speaker / Nomination",
  "Accommodation",
  "Travel Assistance",
  "Media & Press",
  "Other",
];

export default function ContactClient() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactForm>();

  const onSubmit = async (_data: ContactForm) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
  };

  const inputCls = (err?: boolean) => `
    w-full px-4 py-3 rounded-xl border text-sm bg-white
    placeholder:text-[var(--muted-text)]/60 text-[var(--dark-text)]
    focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:border-transparent
    transition-all duration-200
    ${err ? "border-red-400 bg-red-50" : "border-[var(--gold-500)]/25 hover:border-[var(--gold-500)]/60"}
  `;

  return (
    <div className="bg-[var(--cream-50)] min-h-screen">

      {/* Hero */}
      <section className="relative py-24 md:py-28 overflow-hidden">
        <div className="absolute inset-0 tribal-pattern-bg opacity-30" aria-hidden />
        <div className="absolute left-0 top-0 w-72 h-72 opacity-20 pointer-events-none" aria-hidden>
          <img src="/cultural/gondi-sun.svg" alt="" className="w-full h-full" />
        </div>
        <div className="container-site relative z-10 text-center">
          <GoldenBadge>Contact Us</GoldenBadge>
          <h1 className="mt-6 font-display font-black text-4xl sm:text-5xl md:text-6xl text-[var(--dark-text)] leading-tight">
            Get in <span className="text-gradient-crimson">Touch</span>
          </h1>
          <p className="mt-5 text-base md:text-lg text-[var(--muted-text)] max-w-xl mx-auto">
            Have a question about registration, sponsorship, abstract submission or travel? We'd love to hear from you.
          </p>
        </div>
      </section>

      <CulturalDivider variant="bastar" className="opacity-40" />

      <section className="py-16 md:py-20">
        <div className="container-site">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* Contact info */}
            <div className="space-y-5">
              <ScrollReveal>
                <h2 className="font-display font-bold text-2xl text-[var(--dark-text)] mb-6">Contact Information</h2>
              </ScrollReveal>

              {CONTACTS.map(({ icon: Icon, label, value, href }) => (
                <ScrollReveal key={label}>
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-white border border-[var(--gold-500)]/15 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[var(--crimson-800)]/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={18} className="text-[var(--crimson-800)]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-[var(--gold-500)] mb-1">{label}</p>
                      {href
                        ? <a href={href} className="text-sm text-[var(--crimson-800)] hover:underline font-medium break-all">{value}</a>
                        : <p className="text-sm text-[var(--dark-text)]">{value}</p>
                      }
                    </div>
                  </div>
                </ScrollReveal>
              ))}

              {/* Organizer detail */}
              <ScrollReveal>
                <div className="p-5 rounded-2xl bg-[var(--crimson-800)] text-white">
                  <p className="text-xs font-bold tracking-widest uppercase text-[var(--gold-400)] mb-3">Organized By</p>
                  <p className="font-semibold text-sm">{EVENT.host}</p>
                  <p className="text-xs text-white/70 mt-1 leading-relaxed">In association with</p>
                  <p className="text-xs text-white/70 leading-relaxed">{EVENT.partner}</p>
                  <span className="inline-block mt-3 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm bg-[var(--gold-500)]/20 text-[var(--gold-400)]">
                    {EVENT.universityAccreditation}
                  </span>
                </div>
              </ScrollReveal>

              {/* Map */}
              <ScrollReveal>
                <div className="rounded-2xl overflow-hidden shadow-sm border border-[var(--gold-500)]/20 aspect-square">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.8!2d81.6296!3d21.2514!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28dd5a7b4dd70d%3A0xf5b2ec7c97b86d3e!2sPt.%20Deendayal%20Upadhyaya%20Auditorium!5e0!3m2!1sen!2sin!4v1"
                    width="100%" height="100%" style={{ border: 0 }}
                    allowFullScreen loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Venue location map"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <ScrollReveal className="mb-6">
                <h2 className="font-display font-bold text-2xl text-[var(--dark-text)]">Send Us a Message</h2>
              </ScrollReveal>

              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm p-12 text-center"
                >
                  <CheckCircle size={56} className="mx-auto text-emerald-500 mb-4" />
                  <h3 className="font-display font-bold text-2xl text-[var(--dark-text)] mb-2">Message Sent!</h3>
                  <p className="text-[var(--muted-text)] max-w-sm mx-auto">
                    Thank you for reaching out. Our team will respond within 2–3 business days.
                  </p>
                </motion.div>
              ) : (
                <ScrollReveal>
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="rounded-2xl bg-white border border-[var(--gold-500)]/20 shadow-sm p-6 md:p-8 space-y-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register("name", { required: "Name required" })}
                          placeholder="Full name"
                          className={inputCls(!!errors.name)}
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          {...register("email", {
                            required: "Email required",
                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
                          })}
                          placeholder="your@email.com"
                          className={inputCls(!!errors.email)}
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        {...register("subject", { required: "Please select a subject" })}
                        className={inputCls(!!errors.subject)}
                      >
                        <option value="">Select Subject</option>
                        {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--muted-text)] uppercase tracking-wide mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register("message", {
                          required: "Message required",
                          minLength: { value: 20, message: "Please write at least 20 characters" },
                        })}
                        rows={6}
                        placeholder="Write your message here…"
                        className={`${inputCls(!!errors.message)} resize-none`}
                      />
                      {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-xl font-bold text-base bg-[var(--crimson-800)] text-white hover:bg-[var(--crimson-700)] disabled:opacity-60 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--gold-400)] focus:ring-offset-2"
                    >
                      {isSubmitting ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                </ScrollReveal>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
