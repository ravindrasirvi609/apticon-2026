import GroupRegistrationsList from "@/components/console/GroupRegistrationsList";

export default function AdminGroupRegistrationsPage() {
  return (
    <GroupRegistrationsList
      detailBase="/admin/group-registrations"
      title="Group Registrations"
      description="Bulk institutional bookings across the pipeline."
    />
  );
}
