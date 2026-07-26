import RegistrationDetail from "@/components/console/RegistrationDetail";

export default async function ApproverRegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistrationDetail id={id} backHref="/approver/registrations" isAdmin={false} />;
}
