import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { getSenderInfo, isEmailConfigured } from "@/lib/email";
import EmailsClient from "./EmailsClient";

export const metadata = { title: "Bulk Email" };

export default async function AdminEmailsPage() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "super_admin") redirect("/admin/login");

  return (
    <EmailsClient
      configured={isEmailConfigured()}
      sandboxSender={getSenderInfo().sandbox}
      adminEmail={session.email}
    />
  );
}
