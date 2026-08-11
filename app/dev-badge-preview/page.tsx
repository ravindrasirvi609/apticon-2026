import RegistrationSuccessExperience from "@/components/registration/success/RegistrationSuccessExperience";
import type { BadgeData } from "@/components/registration/success/types";

/**
 * TEMPORARY, dev-only harness to visually verify the interactive badge without a live MongoDB
 * connection. Not part of the shipped feature — delete before merging.
 */
export default function DevBadgePreviewPage() {
  const badge: BadgeData = {
    registrationCode: "AM1001",
    fullName: "Dr. Ravindra Choudhary",
    designation: "Associate Professor",
    institution: "Government College of Pharmacy",
    category: "APTI Life Member",
    photoUrl: "",
    confirmed: true,
  };

  const qrDataUrl =
    "data:image/svg+xml;base64," +
    Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140"><rect width="140" height="140" fill="white"/><text x="70" y="75" text-anchor="middle" font-size="12">QR</text></svg>'
    ).toString("base64");

  return <RegistrationSuccessExperience badge={badge} qrDataUrl={qrDataUrl} />;
}
