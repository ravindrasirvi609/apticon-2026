import { generateRegistrationQrDataUrl } from "@/lib/qrcode";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import RegistrationSuccessExperience from "@/components/registration/success/RegistrationSuccessExperience";
import type { BadgeData } from "@/components/registration/success/types";

export default async function RegistrationSuccessPage({
  params, searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { code } = await params;
  const { payment } = await searchParams;
  const confirmed = payment === "confirmed";
  const qrDataUrl = await generateRegistrationQrDataUrl(code);

  await connectDB();
  const reg = await Registration.findOne({ registrationCode: code.toUpperCase() })
    .select("fullName designation institution category photoUrl")
    .lean();

  const badge: BadgeData = {
    registrationCode: code,
    fullName: reg?.fullName?.trim() || "Delegate",
    designation: reg?.designation?.trim() || "Delegate",
    institution: reg?.institution?.trim() || "APTICON 2026",
    category: reg?.category ?? "",
    photoUrl: reg?.photoUrl ?? "",
    confirmed,
  };

  return <RegistrationSuccessExperience badge={badge} qrDataUrl={qrDataUrl} />;
}
