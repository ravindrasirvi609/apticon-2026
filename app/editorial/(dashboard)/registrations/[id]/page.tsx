import RegistrationDetail from "@/components/console/RegistrationDetail";

export default async function EditorialRegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistrationDetail id={id} backHref="/editorial/registrations" isAdmin={false} />;
}
