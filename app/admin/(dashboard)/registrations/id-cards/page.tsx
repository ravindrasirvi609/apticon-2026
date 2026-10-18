import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { generateRegistrationQrDataUrl } from "@/lib/qrcode";
import BulkIdCards from "@/components/console/BulkIdCards";

export default async function AdminIdCardsPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "super_admin") redirect("/admin/login");

  await connectDB();
  const registrations = await Registration.find({ status: "approved" })
    .sort({ fullName: 1 })
    .lean();

  const cards = await Promise.all(
    registrations.map(async (registration) => ({
      fullName: registration.fullName,
      designation: registration.designation,
      institution: registration.institution,
      category: registration.category,
      registrationCode: registration.registrationCode,
      photoUrl: registration.photoUrl || "",
      qrCode: await generateRegistrationQrDataUrl(registration.registrationCode),
    })),
  );

  return <BulkIdCards cards={cards} />;
}
