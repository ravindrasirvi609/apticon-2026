"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ImagePlus, X, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/shadcn/dialog";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { Label } from "@/components/ui/shadcn/label";
import { Textarea } from "@/components/ui/shadcn/textarea";
import { Badge } from "@/components/ui/shadcn/badge";
import DelegatePhoto from "@/components/ui/DelegatePhoto";
import RegistrationStatusBadge from "@/components/console/RegistrationStatusBadge";
import { INDIAN_STATES, DESIGNATIONS } from "@/lib/constants";
import { UPLOAD_PHOTO_TYPES, UPLOAD_RULES } from "@/lib/validators/upload";

export interface EditableDelegateData {
  _id: string;
  registrationCode?: string;
  fullName: string;
  email: string;
  phone?: string;
  designation?: string;
  institution: string;
  affiliation?: string;
  city?: string;
  state?: string;
  category?: string;
  feeAmount?: number;
  feeTier?: string;
  status?: string;
  paymentStatus?: string;
  photoUrl?: string;
  photoKey?: string;
  photoName?: string;
  remarks?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: EditableDelegateData | null;
  onSuccess: (updated: EditableDelegateData) => void;
}

const MAX_PHOTO_MB = UPLOAD_RULES.photo.maxBytes / (1024 * 1024);

export default function EditRegistrationDialog({
  open,
  onOpenChange,
  registration,
  onSuccess,
}: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [designationType, setDesignationType] = useState<string>("");
  const [customDesignation, setCustomDesignation] = useState("");
  const [institution, setInstitution] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [remarks, setRemarks] = useState("");

  // Photo management
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Initialize or fetch full registration data when dialog opens
  useEffect(() => {
    if (!open || !registration) return;

    // Reset photo states
    setNewPhotoFile(null);
    setPhotoRemoved(false);
    setPhotoPreview(registration.photoUrl || null);

    // Initial prefill
    setFullName(registration.fullName || "");
    setEmail(registration.email || "");
    setPhone(registration.phone || "");
    setInstitution(registration.institution || "");
    setAffiliation(registration.affiliation || "");
    setCity(registration.city || "");
    setState(registration.state || "");
    setRemarks(registration.remarks || "");

    const des = registration.designation || "";
    if (DESIGNATIONS.includes(des as (typeof DESIGNATIONS)[number])) {
      setDesignationType(des);
      setCustomDesignation("");
    } else if (des) {
      setDesignationType("Other");
      setCustomDesignation(des);
    } else {
      setDesignationType("");
      setCustomDesignation("");
    }

    // If certain fields might not be present in a list view (e.g. phone/remarks),
    // fetch the full registration record from the detail endpoint.
    let isCancelled = false;
    setLoadingDetails(true);

    fetch(`/api/registrations/${registration._id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isCancelled || !data?.registration) return;
        const reg = data.registration;
        setFullName(reg.fullName || "");
        setEmail(reg.email || "");
        setPhone(reg.phone || "");
        setInstitution(reg.institution || "");
        setAffiliation(reg.affiliation || "");
        setCity(reg.city || "");
        setState(reg.state || "");
        setRemarks(reg.remarks || "");
        setPhotoPreview(reg.photoUrl || null);

        const currentDes = reg.designation || "";
        if (DESIGNATIONS.includes(currentDes as (typeof DESIGNATIONS)[number])) {
          setDesignationType(currentDes);
          setCustomDesignation("");
        } else if (currentDes) {
          setDesignationType("Other");
          setCustomDesignation(currentDes);
        }
      })
      .catch((err) => {
        console.error("Failed to load registration details for editing:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoadingDetails(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [open, registration]);

  function handlePhotoPicked(file: File | null) {
    if (!file) return;

    if (!UPLOAD_PHOTO_TYPES.includes(file.type as (typeof UPLOAD_PHOTO_TYPES)[number])) {
      toast.error(`Please choose a ${UPLOAD_RULES.photo.label} image.`);
      return;
    }
    if (file.size > UPLOAD_RULES.photo.maxBytes) {
      toast.error(`Photo must be under ${MAX_PHOTO_MB} MB.`);
      return;
    }

    setNewPhotoFile(file);
    setPhotoRemoved(false);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  }

  function handleRemovePhoto() {
    setNewPhotoFile(null);
    setPhotoRemoved(true);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!registration) return;

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const resolvedDesignation =
      designationType === "Other" ? customDesignation.trim() : designationType.trim();
    const trimmedInstitution = institution.trim();

    if (trimmedName.length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (trimmedPhone.length < 6) {
      toast.error("Please enter a valid phone number (at least 6 digits).");
      return;
    }
    if (!resolvedDesignation) {
      toast.error("Designation is required.");
      return;
    }
    if (trimmedInstitution.length < 2) {
      toast.error("Institution must be at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      let photoKey: string | null | undefined = undefined;
      let photoName: string | null | undefined = undefined;

      // Upload new photo if selected
      if (newPhotoFile) {
        const formData = new FormData();
        formData.append("file", newPhotoFile);
        formData.append("purpose", "photo");

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadBody = await uploadRes.json().catch(() => null);
        if (!uploadRes.ok) {
          throw new Error(uploadBody?.error || "Failed to upload delegate photo");
        }
        photoKey = uploadBody.key;
        photoName = newPhotoFile.name;
      } else if (photoRemoved) {
        photoKey = null;
        photoName = null;
      }

      const payload: Record<string, unknown> = {
        fullName: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        designation: resolvedDesignation,
        institution: trimmedInstitution,
        affiliation: affiliation.trim(),
        city: city.trim(),
        state: state.trim(),
        remarks: remarks.trim(),
      };

      if (photoKey !== undefined) {
        payload.photoKey = photoKey;
        payload.photoName = photoName;
      }

      const res = await fetch(`/api/registrations/${registration._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData?.error || "Failed to update registration");
      }

      toast.success(`Delegate details for ${trimmedName} updated.`);
      onSuccess(resData.registration);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update registration");
    } finally {
      setSaving(false);
    }
  }

  if (!registration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Delegate Information</DialogTitle>
          <DialogDescription>
            Update personal contact and identity details. Payment and registration status are protected and cannot be changed here.
          </DialogDescription>
        </DialogHeader>

        {/* Read-only Context Strip */}
        <div className="rounded-lg bg-[var(--surface-100)] border border-[var(--accent-500)]/20 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[var(--dark-text)]">
              Code: <span className="font-mono">{registration.registrationCode || "Pending"}</span>
            </span>
            {registration.category && (
              <Badge variant="outline" className="text-[11px]">
                {registration.category}
              </Badge>
            )}
            {typeof registration.feeAmount === "number" && (
              <span className="text-[var(--muted-text)]">
                Fee: ₹{registration.feeAmount.toLocaleString("en-IN")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <RegistrationStatusBadge
              status={registration.status || "submitted"}
              paymentStatus={registration.paymentStatus}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-1">
          {/* Delegate Photo Picker */}
          <div className="flex items-center gap-4 p-3 rounded-lg border border-[var(--accent-500)]/15 bg-white">
            <DelegatePhoto
              url={photoPreview || undefined}
              name={fullName || "Delegate"}
              size={64}
            />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="text-xs font-semibold text-[var(--dark-text)] uppercase tracking-wider">
                Profile Photo
              </div>
              <p className="text-xs text-[var(--muted-text)]">
                JPG, PNG or WebP under {MAX_PHOTO_MB} MB. Used for badge printing and directory.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => handlePhotoPicked(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving || loadingDetails}
                >
                  <ImagePlus className="w-3.5 h-3.5 mr-1" />
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleRemovePhoto}
                    disabled={saving || loadingDetails}
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <Label htmlFor="edit-fullName" className="text-xs font-medium">
                Full Name *
              </Label>
              <Input
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. / Prof. / Mr. Name"
                className="mt-1"
                required
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="edit-email" className="text-xs font-medium">
                Email Address *
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="delegate@example.com"
                className="mt-1"
                required
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="edit-phone" className="text-xs font-medium">
                Mobile Number *
              </Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="mt-1"
                required
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="edit-designation" className="text-xs font-medium">
                Designation *
              </Label>
              <select
                id="edit-designation"
                value={designationType}
                onChange={(e) => setDesignationType(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-[var(--accent-500)]/30 bg-white px-3 py-1 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                disabled={saving}
                required
              >
                <option value="">Select Designation</option>
                {DESIGNATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                <option value="Other">Other / Custom</option>
              </select>
            </div>

            {designationType === "Other" && (
              <div className="sm:col-span-2">
                <Label htmlFor="edit-custom-designation" className="text-xs font-medium">
                  Custom Designation *
                </Label>
                <Input
                  id="edit-custom-designation"
                  value={customDesignation}
                  onChange={(e) => setCustomDesignation(e.target.value)}
                  placeholder="e.g. Associate Dean / Scientist"
                  className="mt-1"
                  required
                  disabled={saving}
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <Label htmlFor="edit-institution" className="text-xs font-medium">
                Institution / College *
              </Label>
              <Input
                id="edit-institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="Full name of institute or university"
                className="mt-1"
                required
                disabled={saving}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="edit-affiliation" className="text-xs font-medium">
                Affiliation / Department
              </Label>
              <Input
                id="edit-affiliation"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                placeholder="e.g. Dept of Pharmaceutics (optional)"
                className="mt-1"
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="edit-city" className="text-xs font-medium">
                City
              </Label>
              <Input
                id="edit-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="mt-1"
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="edit-state" className="text-xs font-medium">
                State
              </Label>
              <select
                id="edit-state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 flex h-9 w-full rounded-md border border-[var(--accent-500)]/30 bg-white px-3 py-1 text-sm text-[var(--dark-text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-400)]"
                disabled={saving}
              >
                <option value="">Select State</option>
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="edit-remarks" className="text-xs font-medium">
                Delegate Remarks / Notes
              </Label>
              <Textarea
                id="edit-remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Any special remarks or notes submitted by delegate"
                rows={2}
                className="mt-1 resize-y"
                disabled={saving}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || loadingDetails}
              className="bg-[var(--primary-800)] hover:bg-[var(--primary-900)] text-white gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
