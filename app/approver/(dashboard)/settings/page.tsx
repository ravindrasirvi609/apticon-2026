import ChangePasswordCard from "@/components/auth/ChangePasswordCard";
import PageHeader from "@/components/console/PageHeader";

export default function ApproverSettingsPage() {
  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <PageHeader title="Settings" description="Update your account." />
      <ChangePasswordCard />
    </div>
  );
}
