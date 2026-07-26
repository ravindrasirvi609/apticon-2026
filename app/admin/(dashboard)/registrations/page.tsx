import RegistrationsList from "@/components/console/RegistrationsList";

export default function AdminRegistrationsPage() {
  return <RegistrationsList detailBase="/admin/registrations" title="Registrations" description="All delegate registrations across the pipeline." />;
}
