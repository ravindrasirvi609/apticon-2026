import RegistrationsList from "@/components/console/RegistrationsList";

export default function EditorialRegistrationsPage() {
  return (
    <RegistrationsList
      detailBase="/editorial/registrations"
      title="Registrations"
      description="All delegate registrations. Payments are confirmed by Razorpay — open a record to re-check one against the gateway."
    />
  );
}
