import ReviewerAbstractDetail from "./ReviewerAbstractDetail";

export default async function ReviewerAbstractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReviewerAbstractDetail id={id} />;
}
