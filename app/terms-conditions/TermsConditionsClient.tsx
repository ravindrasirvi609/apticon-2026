"use client";
import Link from "next/link";
import {
  LegalPageLayout,
  LegalH2,
  LegalP,
  LegalList,
} from "@/components/legal/LegalContent";
import { EVENT } from "@/lib/constants";

export default function TermsConditionsClient() {
  return (
    <LegalPageLayout
      badge="Legal"
      title="Terms & Conditions"
      updated="2 August 2026"
    >
      <LegalP>
        APTICON 2026, organized by {EVENT.host} in association with{" "}
        {EVENT.partner}, allows you to use this website on the following terms.
        Your continued use of this website constitutes your consent and
        acknowledgment of these terms:
      </LegalP>

      <LegalList
        items={[
          <>
            <strong className="text-[var(--dark-text)]">Disclaimer: </strong>
            This website has been created to provide general information about
            APTICON 2026 and its organizers, including their activities and
            services. Nothing on this website should be construed as a
            solicitation or promotion for any product or service that is not
            endorsed under the laws and regulations of the country you are
            accessing this website from.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">Viruses: </strong>
            We do not warrant that this website will be free from viruses or
            other threats to your computer or software that might be transmitted
            electronically. We will not be liable for any damage caused by any
            such viruses or other material.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Reliability of information:{" "}
            </strong>
            We endeavor to ensure that the information provided on this website
            is accurate and up to date. However, you acknowledge that we do not
            guarantee or warrant the accuracy or completeness of the information
            on this website. To the extent permitted by applicable law, we
            accept no responsibility for any errors or omissions in the content
            of this website. We reserve the right to change or add to the
            information provided on this website, including these terms, without
            notice.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Linked third-party sites:{" "}
            </strong>
            This website may provide links or references to other websites that
            are not affiliated with APTICON 2026. Such links are provided only
            as a convenience to users. We have not reviewed all of the sites
            that may be linked to this website and are not responsible for the
            content of any other site linked to this website. You access linked
            third-party sites entirely at your own risk.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Copyright and trademarks:{" "}
            </strong>
            Unless otherwise indicated, APTICON 2026 and its organizers own, or
            use under license, all copyright, trademarks, and other intellectual
            property rights in the content and structure of this website. You
            must not reproduce, modify, store in a retrieval system, transmit,
            print, display, perform, or distribute all or any part of this
            website. You may view the content of this website on your internet
            browser for your own personal or non-commercial purposes only. The
            APTICON name and logo are trademarks of the organizers and their
            affiliates. You must not use those names or any related logos
            without first obtaining written permission.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              No interference:{" "}
            </strong>
            You agree that you will not use any device, software, or routine in
            an attempt to interfere with the proper operation of this website.
            Any access or attempt to access other areas of our computer systems
            or any information on our systems is strictly prohibited.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Exclusion of liability:{" "}
            </strong>
            To the extent legally permitted, APTICON 2026 is not liable to you
            for any claim, cost, loss, or damage caused by you arising directly
            or indirectly out of your access to or use of (or inability to
            access or use) this website, whether direct, consequential,
            incidental, indirect, or other loss or damage, and whether such
            liability arises out of contract, tort, statute, or otherwise.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">Image use: </strong>
            Images of people or places displayed on the website are either the
            property of, or used with permission by, APTICON 2026 and its
            organizers. Use of these images by you, or anyone authorized by you,
            is prohibited unless expressly permitted by these Terms or by
            specific consent given elsewhere on the website or in a separate
            writing signed by an authorized representative of the organizers.
            Any unauthorized use of the images may violate copyright laws,
            trademark laws, privacy and publicity laws, and possibly other
            statutes and regulations. Depictions of, or references to, products,
            services, or publications within the website do not imply
            endorsement of that product, service, or publication.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">Privacy: </strong>
            We recognize the importance of protecting your privacy. Please read
            our{" "}
            <Link
              href="/privacy-policy"
              className="text-[var(--primary-800)] font-semibold hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            for more information.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">Login process: </strong>
            To access certain areas of the website, users may be required to
            enter a username and password to log in. Users will access the
            website only through the login page provided and will not allow any
            other individual to sign in using their username and password. Users
            will ensure that they log off from their account at the end of every
            session on the website, will not disclose their username and
            password to any other individual, and will keep their credentials
            confidential for the duration of this agreement. If a user discovers
            that another party has accessed their username and password, they
            will promptly notify us of such access. In such an event, we will
            delete the user&apos;s old credentials and, at our sole discretion,
            issue new ones.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Consent to disclosure and monitoring:{" "}
            </strong>
            We are under no obligation to monitor the data residing on or
            transmitted to or from this website. We undertake no obligation to
            determine whether your conduct during your use of the website
            complies with applicable laws or regulations. However, you agree
            that we may, at our sole discretion, monitor the website in relation
            to its operation in order to protect users of the website and comply
            with applicable laws, regulations, or requests from government
            authorities. Unless provided in writing by us or covered as
            confidential in the Privacy Policy, all data provided by you
            regarding the website will be deemed not to be confidential, and we
            will not shield any such data from disclosure. We will be free to
            use, disclose, and distribute such non-confidential data to third
            parties without restriction.
          </>,
          <>
            <strong className="text-[var(--dark-text)]">
              Interactive restrictions:{" "}
            </strong>
            This applies to the interactive elements of the website. You agree
            not to post anything that disparages any individual or their views,
            or which is, or may be perceived to be, obscene, offensive, unlawful
            in any other way (for example, inciting racial or religious hatred),
            threatening, disrespectful, abusive, or which constitutes a notice.
            You agree that you will ensure that all information you have placed
            in your profile in order to access the interactive parts of the
            website is true, accurate, and complete. You accept that once your
            comment has been posted you will not remove it without our
            permission, to maintain the integrity of the discussion, since
            someone may reply to your post and its removal could render that
            reply meaningless. You accept that we have the right to remove from
            the website any posting you make that violates these Terms or that
            we are required to remove for legal reasons. You agree that you will
            only submit original content and will not include anything that
            infringes any other individual&apos;s intellectual property rights.
            You agree that if you fail to respect these Terms, we may terminate
            your interactive rights.
          </>,
        ]}
      />

      <LegalH2>Governing law</LegalH2>
      <LegalP>
        We reserve the right to change these Terms and Conditions of Use,
        prices, information, and available administrative license terms included
        on this website without notice. These conditions set out the entire
        understanding between APTICON 2026 and you in relation to your use of
        this website. This agreement is governed by the laws of India and
        subject to the exclusive jurisdiction of the courts at Raipur,
        Chhattisgarh.
      </LegalP>

      <LegalP>
        For any questions regarding these Terms, please contact us at{" "}
        <a
          href={`mailto:${EVENT.contact}`}
          className="text-[var(--primary-800)] font-semibold hover:underline"
        >
          {EVENT.contact}
        </a>
        .
      </LegalP>
    </LegalPageLayout>
  );
}
