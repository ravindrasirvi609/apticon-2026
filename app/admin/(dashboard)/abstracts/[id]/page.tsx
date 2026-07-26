import AbstractDetailClient from "./AbstractDetailClient";

export default async function AdminAbstractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AbstractDetailClient id={id} />;
}
