import { Suspense } from "react";
import AbstractsList from "@/components/console/AbstractsList";

export default function AdminAbstractsPage() {
  return (
    <Suspense fallback={null}>
      <AbstractsList detailBase="/admin/abstracts" />
    </Suspense>
  );
}
