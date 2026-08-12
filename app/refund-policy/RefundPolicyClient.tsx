"use client";
import { LegalPageLayout, LegalH2, LegalP } from "@/components/legal/LegalContent";
import { EVENT } from "@/lib/constants";

export default function RefundPolicyClient() {
  return (
    <LegalPageLayout badge="Legal" title="Refund & Cancellation Policy" updated="2 August 2026">
      <LegalH2>Cancellation and refund policy</LegalH2>
      <LegalP>
        We understand that circumstances may change, but please note that the amount paid for
        registration to APTICON 2026 is non-refundable and non-transferable. Once payment is made, it
        cannot be refunded or transferred to another individual or event. We appreciate your
        understanding of this policy, as it allows us to efficiently manage registrations and provide
        the best possible experience for all participants.
      </LegalP>
      <LegalP>
        If you have any questions or concerns, please feel free to contact us at{" "}
        <a href={`mailto:${EVENT.contact}`} className="text-[var(--primary-800)] font-semibold hover:underline">
          {EVENT.contact}
        </a>
        .
      </LegalP>

      <LegalH2>Shipping &amp; exchange policy</LegalH2>
      <LegalP>
        This policy is not applicable to our category of services, as APTICON 2026 does not ship any
        physical goods as part of registration. If any physical item (such as conference kits or
        printed materials) is provided at the venue and needs to be exchanged, delegates are
        responsible for return shipping costs, if applicable. We recommend using a trackable shipping
        service, and we cannot guarantee that we will receive your returned item.
      </LegalP>
    </LegalPageLayout>
  );
}
