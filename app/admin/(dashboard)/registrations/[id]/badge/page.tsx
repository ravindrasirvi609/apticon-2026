import RegistrationBadge from "@/components/console/RegistrationBadge";

export default async function AdminRegistrationBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistrationBadge id={id} detailHref={`/admin/registrations/${id}`} />;
}
