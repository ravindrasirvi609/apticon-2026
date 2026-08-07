import RegistrationBadge from "@/components/console/RegistrationBadge";

export default async function EditorialRegistrationBadgePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RegistrationBadge id={id} detailHref={`/editorial/registrations/${id}`} />;
}
