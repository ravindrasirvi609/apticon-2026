import RegistrationDetail from "@/components/console/RegistrationDetail";

export default async function AdminRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <RegistrationDetail
      id={id}
      backHref="/admin/registrations"
      isAdmin
      abstractDetailBase="/admin/abstracts"
    />
  );
}
