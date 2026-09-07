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
import InstitutionalLetterUploadField from "@/components/registration/InstitutionalLetterUploadField";
import {
  REGISTRATION_CATEGORIES,
  FEE_TABLE,
  GST_RATE,
  calculateFeeWithGst,
  currentFeeAmount,
  formatRupees,
  type RegistrationCategory,
} from "@/lib/registration-fees";
import {
  APTI_MEMBER_CATEGORIES,
  NEW_APTI_MEMBERSHIP_CATEGORY,
} from "@/lib/validators/registration";
import {
  BLOOD_GROUPS,
  GENDERS,
  REGIONS,
  QUALIFICATIONS,
  NATIONALITIES,
} from "@/lib/apti-membership-application";
import AptiMembershipIdField from "@/components/ui/AptiMembershipIdField";
import PaymentRedirectDialog from "@/components/registration/PaymentRedirectDialog";

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
  aptiMemberId: string;
  remarks: string;

  // Only used for the "APTI Membership + APTICON Registration" category — mirrors
  // https://aptiindia.org/membership_form_general.
  bloodGroup: string;
  gender: string;
  dob: string;
  college: string;
  professionalState: string;
  region: string;
  qualification: string;
  teachingExperience: string;
  professionalExperience: string;
  nationality: string;
  professionalStatus: string;
  reference: string;
  officeAddress: string;
  officePincode: string;
  officeCity: string;
  officeState: string;
  officePhone: string;
  officeFax: string;
  officeEmail: string;
  residenceAddress: string;
  residencePincode: string;
  residenceCity: string;
  residenceState: string;
  residencePhone: string;
  residenceEmail: string;
}

const STATES = [
  "Andhra Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu & Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Other",
];

const DESIGNATIONS = [
  "Vice Chancellor",
  "Principal / Dean / Director",
  "Professor / Teacher",
  "Research Scholars / PG Students",
  "UG Students",
  "Professionals / Consultants",
];

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
  handler: (response: RazorpayResponse) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}

function loadRazorpayCheckout() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Could not load Razorpay")),
        { once: true },
      );
      return;
    }
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
  const [redirectingToConfirmation, setRedirectingToConfirmation] =
    useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [institutionalLetter, setInstitutionalLetter] = useState<File | null>(
    null,
  );
  const [institutionalLetterError, setInstitutionalLetterError] = useState<
    string | null
  >(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { willSubmitAbstract: false },
  });

  const category = watch("category");
  const chosenCategory: RegistrationCategory | null =
    category &&
    REGISTRATION_CATEGORIES.includes(category as RegistrationCategory)
      ? (category as RegistrationCategory)
      : null;
  const currentFee = chosenCategory ? currentFeeAmount(chosenCategory) : null;
  const feeBreakdown = currentFee
    ? calculateFeeWithGst(currentFee.amount)
    : null;
  const requiresMembershipId =
    !!chosenCategory &&
    APTI_MEMBER_CATEGORIES.includes(
      chosenCategory as (typeof APTI_MEMBER_CATEGORIES)[number],
    );
  const requiresMembershipDetails =
    chosenCategory === NEW_APTI_MEMBERSHIP_CATEGORY;

  /** Uploads a file for the given purpose and returns its storage key, or null on failure. */
  async function uploadFile(
    file: File,
    purpose: "photo" | "institutionalLetter",
  ): Promise<string | null> {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("purpose", purpose);
    const res = await fetch("/api/upload", { method: "POST", body: payload });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(body?.error ?? "Upload failed. Please try again.");
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

    if (requiresMembershipDetails && !institutionalLetter) {
      setInstitutionalLetterError("An institutional letter is required.");
      toast.error("Please upload your institutional letter.");
      return;
    }
    setInstitutionalLetterError(null);

    // Upload first — no point creating an order we'd have to discard.
    setUploading(true);
    const photoKey = await uploadFile(photo, "photo");
    if (!photoKey) {
      setUploading(false);
      return;
    }
    let institutionalLetterKey: string | null = null;
    if (requiresMembershipDetails && institutionalLetter) {
      institutionalLetterKey = await uploadFile(
        institutionalLetter,
        "institutionalLetter",
      );
      if (!institutionalLetterKey) {
        setUploading(false);
        return;
      }
    }
    setUploading(false);

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
        aptiMemberId: data.aptiMemberId || undefined,
        remarks: data.remarks || undefined,
        membershipDetails: requiresMembershipDetails
          ? {
              bloodGroup: data.bloodGroup,
              gender: data.gender,
              dob: data.dob,
              college: data.college,
              professionalState: data.professionalState,
              region: data.region,
              qualification: data.qualification,
              teachingExperience: data.teachingExperience,
              professionalExperience: data.professionalExperience,
              nationality: data.nationality,
              professionalStatus: data.professionalStatus || undefined,
              reference: data.reference || undefined,
              institutionalLetterKey,
              institutionalLetterName: institutionalLetter!.name,
              officeAddress: data.officeAddress,
              officePincode: data.officePincode,
              officeCity: data.officeCity,
              officeState: data.officeState,
              officePhone: data.officePhone,
              officeFax: data.officeFax || undefined,
              officeEmail: data.officeEmail,
              residenceAddress: data.residenceAddress,
              residencePincode: data.residencePincode,
              residenceCity: data.residenceCity,
              residenceState: data.residenceState,
              residencePhone: data.residencePhone,
              residenceEmail: data.residenceEmail,
            }
          : undefined,
      }),
    });
    const body = await res.json().catch(() => ({}));
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
        description: "APTICON 2026 Registration",
        order_id: body.orderId,
        prefill: {
          name: data.fullName,
          email: data.email,
          contact: data.phone,
        },
        theme: { color: "#8f1737" },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
          setRedirectingToConfirmation(true);
          try {
            const verify = await fetch("/api/payments/razorpay/verify", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                registrationId: body.registrationId,
                ...response,
              }),
            });
            const result = await verify.json();
            if (!verify.ok)
              throw new Error(result.error ?? "Payment verification failed");
            toast.success(
              result.captured
                ? "Payment confirmed. Your registration is complete."
                : "Payment verified and is being confirmed.",
            );
            router.push(
              `/registration/success/${result.registrationCode ?? "pending"}?payment=${result.captured ? "confirmed" : "processing"}`,
            );
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Payment verification failed. It will be checked automatically.",
            );
            router.push(`/registration/success/pending?payment=processing`);
          } finally {
            setPaying(false);
          }
        },
      });
      checkout.on("payment.failed", () => {
        setPaying(false);
        toast.error("Payment was not completed. You can try again.");
      });
      checkout.open();
    } catch (error) {
      setPaying(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to open secure payment.",
      );
    }
  };

  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-8">
      <PaymentRedirectDialog open={redirectingToConfirmation} />

      {/* Personal Info */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--accent-500)]/20">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <PhotoUploadField
              file={photo}
              onChange={(f) => {
                setPhoto(f);
                if (f) setPhotoError(null);
              }}
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
              {...register("fullName", {
                required: "Full name is required",
                minLength: 2,
              })}
            />
            {errors.fullName && (
              <p className={errCls}>{errors.fullName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="designation">Designation *</Label>
            <select
              id="designation"
              className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
              {...register("designation", {
                required: "Designation is required",
              })}
              defaultValue=""
            >
              <option value="">Select Designation</option>
              {DESIGNATIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.designation && (
              <p className={errCls}>{errors.designation.message}</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="institution">Institution / College *</Label>
            <Input
              id="institution"
              className="mt-2"
              placeholder="Full name of institution"
              {...register("institution", {
                required: "Institution is required",
              })}
            />
            {errors.institution && (
              <p className={errCls}>{errors.institution.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              className="mt-2"
              placeholder="City"
              {...register("city")}
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
              {...register("state")}
              defaultValue=""
            >
              <option value="">Select State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--accent-500)]/20">
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
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Invalid email",
                },
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
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit Indian mobile number",
                },
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
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--accent-500)]/20">
          Registration Category
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Category *</Label>
            <select
              id="category"
              className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
              {...register("category", {
                required: "Please select a category",
              })}
              defaultValue=""
            >
              <option value="">Select Category</option>
              {REGISTRATION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className={errCls}>{errors.category.message}</p>
            )}
          </div>
          <div>
            <Label>Fee Calculator</Label>
            <div className="mt-2 min-h-10 px-3 py-2.5 rounded-lg bg-[var(--surface-100)] border border-[var(--accent-500)]/25">
              {currentFee && feeBreakdown ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">
                      Registration fee
                    </span>
                    <span>{formatRupees(currentFee.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[var(--muted-text)]">
                      GST ({GST_RATE * 100}%)
                    </span>
                    <span>{formatRupees(feeBreakdown.gstAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-[var(--accent-500)]/25 pt-1 font-semibold">
                    <span className="inline-flex items-center gap-1 text-[var(--dark-text)]">
                      <Calculator className="h-3.5 w-3.5" /> Total payable
                    </span>
                    <b className="text-[var(--primary-800)]">
                      {formatRupees(feeBreakdown.totalAmount)}
                    </b>
                  </div>
                  <span className="block text-[10px] text-[var(--muted-text)] uppercase tracking-wider">
                    {currentFee.tier.replace("_", " ")}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-[var(--muted-text)]/70">
                  Select a category to see the fee
                </span>
              )}
            </div>
          </div>
        </div>
        {chosenCategory && (
          <div className="mt-3 flex items-start gap-2 text-xs text-[var(--muted-text)]">
            <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              Fees are auto-selected based on today&apos;s date; GST is
              calculated at 18% extra. Base-fee tiers for this category: early
              bird {formatRupees(FEE_TABLE[chosenCategory].early_bird)} ·
              regular {formatRupees(FEE_TABLE[chosenCategory].regular)} ·
              on-spot {formatRupees(FEE_TABLE[chosenCategory].on_spot)}.
            </span>
          </div>
        )}
        {requiresMembershipId && (
          <div className="mt-4">
            <AptiMembershipIdField
              registerProps={register("aptiMemberId", {
                validate: (v) =>
                  !requiresMembershipId ||
                  (v?.trim().length ?? 0) >= 3 ||
                  "APTI Membership ID is required for this category",
              })}
              error={errors.aptiMemberId?.message}
              helperText="As printed on your APTI membership card/email — we'll verify this before confirming your registration."
            />
          </div>
        )}
        <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-50)] border border-[var(--accent-500)]/20">
          <input
            type="checkbox"
            id="abstract"
            {...register("willSubmitAbstract")}
            className="mt-0.5 w-4 h-4 accent-[var(--primary-800)] cursor-pointer"
          />
          <label
            htmlFor="abstract"
            className="text-sm text-[var(--dark-text)] cursor-pointer"
          >
            I intend to submit an abstract (review or research article).
            <span className="block text-xs text-[var(--muted-text)] mt-0.5">
              You&apos;ll submit the abstract separately on the{" "}
              <a
                href="/abstracts"
                className="text-[var(--primary-800)] hover:underline"
              >
                Abstracts page
              </a>
              . Registration and abstract will be linked automatically by your
              email.
            </span>
          </label>
        </div>
      </div>

      {/* Membership Details — only for the bundled "APTI Membership + APTICON Registration" category */}
      {requiresMembershipDetails && (
        <div>
          <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--accent-500)]/20">
            Membership Details
          </h3>
          <p className="mb-4 -mt-2 text-xs text-[var(--muted-text)]">
            You&apos;ve chosen to apply for a new APTI membership along with your
            registration. Please fill in the details below (from APTI&apos;s
            membership application) in addition to what you&apos;ve already
            entered above.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bloodGroup">Blood Group *</Label>
              <select
                id="bloodGroup"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("bloodGroup", {
                  required: requiresMembershipDetails
                    ? "Blood group is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && (
                <p className={errCls}>{errors.bloodGroup.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth *</Label>
              <Input
                id="dob"
                type="date"
                className="mt-2"
                {...register("dob", {
                  required: requiresMembershipDetails
                    ? "Date of birth is required"
                    : false,
                })}
              />
              {errors.dob && <p className={errCls}>{errors.dob.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label>Gender *</Label>
              <div className="mt-2 flex flex-wrap gap-4">
                {GENDERS.map((g) => (
                  <label
                    key={g}
                    className="flex items-center gap-2 text-sm text-[var(--dark-text)] cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={g}
                      {...register("gender", {
                        required: requiresMembershipDetails
                          ? "Gender is required"
                          : false,
                      })}
                      className="accent-[var(--primary-800)]"
                    />
                    {g}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className={errCls}>{errors.gender.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="college">College *</Label>
              <Input
                id="college"
                className="mt-2"
                placeholder="College name"
                {...register("college", {
                  required: requiresMembershipDetails
                    ? "College is required"
                    : false,
                })}
              />
              {errors.college && (
                <p className={errCls}>{errors.college.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="professionalState">State *</Label>
              <select
                id="professionalState"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("professionalState", {
                  required: requiresMembershipDetails
                    ? "State is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.professionalState && (
                <p className={errCls}>{errors.professionalState.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="region">Region *</Label>
              <select
                id="region"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("region", {
                  required: requiresMembershipDetails
                    ? "Region is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select Region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className={errCls}>{errors.region.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="qualification">Qualification *</Label>
              <select
                id="qualification"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("qualification", {
                  required: requiresMembershipDetails
                    ? "Qualification is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select Qualification</option>
                {QUALIFICATIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              {errors.qualification && (
                <p className={errCls}>{errors.qualification.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="nationality">Nationality *</Label>
              <select
                id="nationality"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("nationality", {
                  required: requiresMembershipDetails
                    ? "Nationality is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select Nationality</option>
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.nationality && (
                <p className={errCls}>{errors.nationality.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="teachingExperience">Teaching Experience *</Label>
              <Input
                id="teachingExperience"
                className="mt-2"
                placeholder="e.g. 5 years"
                {...register("teachingExperience", {
                  required: requiresMembershipDetails
                    ? "Teaching experience is required"
                    : false,
                })}
              />
              {errors.teachingExperience && (
                <p className={errCls}>{errors.teachingExperience.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="professionalExperience">
                Professional Experience (Other than Teaching) *
              </Label>
              <Input
                id="professionalExperience"
                className="mt-2"
                placeholder="e.g. 3 years"
                {...register("professionalExperience", {
                  required: requiresMembershipDetails
                    ? "Professional experience is required"
                    : false,
                })}
              />
              {errors.professionalExperience && (
                <p className={errCls}>
                  {errors.professionalExperience.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="professionalStatus">Professional Status</Label>
              <Input
                id="professionalStatus"
                className="mt-2"
                placeholder="Optional"
                {...register("professionalStatus")}
              />
            </div>
            <div>
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                className="mt-2"
                placeholder="Optional"
                {...register("reference")}
              />
            </div>
            <div className="sm:col-span-2">
              <InstitutionalLetterUploadField
                file={institutionalLetter}
                onChange={(f) => {
                  setInstitutionalLetter(f);
                  if (f) setInstitutionalLetterError(null);
                }}
                error={institutionalLetterError ?? undefined}
                disabled={uploading || paying}
              />
            </div>
          </div>

          {/* Office Address */}
          <h4 className="font-display font-semibold text-sm text-[var(--dark-text)] mt-6 mb-3">
            Office Address
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="officeAddress">Address *</Label>
              <Input
                id="officeAddress"
                className="mt-2"
                {...register("officeAddress", {
                  required: requiresMembershipDetails
                    ? "Office address is required"
                    : false,
                })}
              />
              {errors.officeAddress && (
                <p className={errCls}>{errors.officeAddress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="officeCity">City *</Label>
              <Input
                id="officeCity"
                className="mt-2"
                {...register("officeCity", {
                  required: requiresMembershipDetails
                    ? "Office city is required"
                    : false,
                })}
              />
              {errors.officeCity && (
                <p className={errCls}>{errors.officeCity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="officeState">State *</Label>
              <select
                id="officeState"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("officeState", {
                  required: requiresMembershipDetails
                    ? "Office state is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.officeState && (
                <p className={errCls}>{errors.officeState.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="officePincode">Pincode *</Label>
              <Input
                id="officePincode"
                inputMode="numeric"
                maxLength={6}
                className="mt-2"
                {...register("officePincode", {
                  required: requiresMembershipDetails
                    ? "Office pincode is required"
                    : false,
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Enter a valid 6-digit pincode",
                  },
                })}
              />
              {errors.officePincode && (
                <p className={errCls}>{errors.officePincode.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="officePhone">Phone Number *</Label>
              <Input
                id="officePhone"
                className="mt-2"
                {...register("officePhone", {
                  required: requiresMembershipDetails
                    ? "Office phone is required"
                    : false,
                })}
              />
              {errors.officePhone && (
                <p className={errCls}>{errors.officePhone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="officeFax">Fax</Label>
              <Input
                id="officeFax"
                className="mt-2"
                placeholder="Optional"
                {...register("officeFax")}
              />
            </div>
            <div>
              <Label htmlFor="officeEmail">Email *</Label>
              <Input
                id="officeEmail"
                type="email"
                className="mt-2"
                {...register("officeEmail", {
                  required: requiresMembershipDetails
                    ? "Office email is required"
                    : false,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
              />
              {errors.officeEmail && (
                <p className={errCls}>{errors.officeEmail.message}</p>
              )}
            </div>
          </div>

          {/* Residence / Communication Address */}
          <h4 className="font-display font-semibold text-sm text-[var(--dark-text)] mt-6 mb-3">
            Residence / Communication Address
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="residenceAddress">Address *</Label>
              <Input
                id="residenceAddress"
                className="mt-2"
                {...register("residenceAddress", {
                  required: requiresMembershipDetails
                    ? "Residence address is required"
                    : false,
                })}
              />
              {errors.residenceAddress && (
                <p className={errCls}>{errors.residenceAddress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="residenceCity">City *</Label>
              <Input
                id="residenceCity"
                className="mt-2"
                {...register("residenceCity", {
                  required: requiresMembershipDetails
                    ? "Residence city is required"
                    : false,
                })}
              />
              {errors.residenceCity && (
                <p className={errCls}>{errors.residenceCity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="residenceState">State *</Label>
              <select
                id="residenceState"
                className="mt-2 flex h-10 w-full rounded-lg border border-[var(--accent-500)]/30 bg-white px-3 py-2 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                {...register("residenceState", {
                  required: requiresMembershipDetails
                    ? "Residence state is required"
                    : false,
                })}
                defaultValue=""
              >
                <option value="">Select State</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.residenceState && (
                <p className={errCls}>{errors.residenceState.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="residencePincode">Pincode *</Label>
              <Input
                id="residencePincode"
                inputMode="numeric"
                maxLength={6}
                className="mt-2"
                {...register("residencePincode", {
                  required: requiresMembershipDetails
                    ? "Residence pincode is required"
                    : false,
                  pattern: {
                    value: /^\d{6}$/,
                    message: "Enter a valid 6-digit pincode",
                  },
                })}
              />
              {errors.residencePincode && (
                <p className={errCls}>{errors.residencePincode.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="residencePhone">Phone Number *</Label>
              <Input
                id="residencePhone"
                className="mt-2"
                {...register("residencePhone", {
                  required: requiresMembershipDetails
                    ? "Residence phone is required"
                    : false,
                })}
              />
              {errors.residencePhone && (
                <p className={errCls}>{errors.residencePhone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="residenceEmail">Email *</Label>
              <Input
                id="residenceEmail"
                type="email"
                className="mt-2"
                {...register("residenceEmail", {
                  required: requiresMembershipDetails
                    ? "Residence email is required"
                    : false,
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Invalid email",
                  },
                })}
              />
              {errors.residenceEmail && (
                <p className={errCls}>{errors.residenceEmail.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment */}
      <div>
        <h3 className="font-display font-bold text-lg text-[var(--dark-text)] mb-4 pb-2 border-b border-[var(--accent-500)]/20">
          Secure Online Payment
        </h3>
        <div className="mb-4 rounded-lg bg-[var(--surface-100)] border border-[var(--accent-500)]/20 p-4 text-sm">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 text-[var(--primary-800)] flex-shrink-0" />
            <div>
              <p className="font-semibold text-[var(--dark-text)] mb-1">
                Pay securely with Razorpay
              </p>
              <p className="text-[var(--muted-text)]">
                After you submit this form, Razorpay will open its secure
                checkout. You can pay using UPI, cards, net banking, or any
                method enabled by the organiser. Your registration is confirmed
                automatically only after payment is captured.
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
          {paying || uploading || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {uploading
                ? "Uploading photo…"
                : paying
                  ? "Opening secure payment…"
                  : "Preparing payment…"}
            </>
          ) : (
            "Continue to Secure Payment"
          )}
        </Button>
        <p className="mt-3 text-center text-xs text-[var(--muted-text)]">
          No manual payment proof is required. Your registration confirmation is
          emailed automatically after Razorpay confirms the payment.
        </p>
      </div>
    </form>
  );
}
