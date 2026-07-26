import RegistrationsList from "@/components/console/RegistrationsList";

export default function ApproverRegistrationsPage() {
  return <RegistrationsList detailBase="/approver/registrations" title="Registrations" description="All delegate registrations. Approvers see payment proof for verification." />;
}
