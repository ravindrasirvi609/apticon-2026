import AbstractDetail from "@/components/console/AbstractDetail";

export default async function EditorialAbstractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AbstractDetail id={id} backHref="/editorial/abstracts" registrationDetailBase="/editorial/registrations" />;
}
