import GroupRegistrationDetail from "@/components/console/GroupRegistrationDetail";

export default async function AdminGroupRegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <GroupRegistrationDetail id={id} backHref="/admin/group-registrations" registrationDetailBase="/admin/registrations" />;
}
