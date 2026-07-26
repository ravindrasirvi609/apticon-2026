import { Suspense } from "react";
import AbstractsListClient from "./AbstractsListClient";

export default function AdminAbstractsPage() {
  return (
    <Suspense fallback={null}>
      <AbstractsListClient />
    </Suspense>
  );
}
