import { Suspense } from "react";
import AbstractsList from "@/components/console/AbstractsList";

export default function EditorialAbstractsPage() {
  return (
    <Suspense fallback={null}>
      <AbstractsList
        detailBase="/editorial/abstracts"
        description="Assign reviewers and record final decisions."
      />
    </Suspense>
  );
}
