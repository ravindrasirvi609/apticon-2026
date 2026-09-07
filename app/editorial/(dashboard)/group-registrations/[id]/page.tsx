import GroupRegistrationDetail from "@/components/console/GroupRegistrationDetail";

export default async function EditorialGroupRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <GroupRegistrationDetail
      id={id}
      backHref="/editorial/group-registrations"
      registrationDetailBase="/editorial/registrations"
    />
  );
}
