import AbstractDetail from "@/components/console/AbstractDetail";

export default async function AdminAbstractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AbstractDetail id={id} backHref="/admin/abstracts" registrationDetailBase="/admin/registrations" />;
}
