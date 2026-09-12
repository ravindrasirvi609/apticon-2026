import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Registration from "@/models/Registration";
import { Button } from "@/components/ui/shadcn/button";
import SocialPostClient from "./SocialPostClient";

export default async function SocialPostPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  await connectDB();
  const registration = await Registration.findOne({
    registrationCode: code.toUpperCase(),
  })
    .select("registrationCode fullName photoUrl status")
    .lean();

  if (!registration) notFound();

  return (
    <main className="min-h-screen bg-[var(--surface-50)] px-4 py-10">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--primary-800)]">
          Your APTICON 2026 Social Post
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-text)]">
          Share your registration announcement with friends and colleagues.
        </p>
        <SocialPostClient
          name={registration.fullName}
          photoUrl={registration.photoUrl}
          code={registration.registrationCode}
        />
        <Link href={`/registration/success/${registration.registrationCode}`}>
          <Button variant="outline" className="mt-5">
            Back to Registration
          </Button>
        </Link>
      </div>
    </main>
  );
}
