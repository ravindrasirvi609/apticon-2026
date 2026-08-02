"use client";
import Link from "next/link";
import { LegalPageLayout, LegalH2, LegalP } from "@/components/legal/LegalContent";
import { EVENT } from "@/lib/constants";

export default function PrivacyPolicyClient() {
  return (
    <LegalPageLayout badge="Legal" title="Privacy Policy" updated="2 August 2026">
      <LegalP>
        This Privacy Policy governs how APTICON 2026, organized by {EVENT.host} in association with{" "}
        {EVENT.partner}, handles your personal information when you use this website.
      </LegalP>

      <LegalH2>Personal data collection</LegalH2>
      <LegalP>
        When visitors leave comments on the site, we collect the data shown in the comments form,
        along with the visitor&apos;s IP address and browser user agent string to help with spam detection.
        Personal data is any information that can be used to identify or contact an individual
        (including but not limited to name, address, email address, username, phone number, age,
        date of birth, gender, educational qualifications, posts and other content you submit to our
        website, and sensitive data such as information relating to your health).
      </LegalP>
      <LegalP>
        All personal information we collect about you will be recorded, used, and protected by us in
        accordance with applicable data protection legislation and this Privacy Policy. We may
        supplement the information you provide with other information we obtain from our dealings
        with you or which we receive from other organizations. Please note that if you don&apos;t provide
        us with the requested personal information, we may not be able to offer you our services.
      </LegalP>

      <LegalH2>Personal data transfer</LegalH2>
      <LegalP>
        We may transfer your personal information to servers located outside the country in which you
        live, or to affiliates or other trusted third parties located in other countries, so that they
        may process personal information on our behalf. By using the APTICON 2026 website, or
        otherwise providing us with personal information, you consent to us doing so in accordance
        with the terms of this Privacy Policy and applicable data protection laws and regulations. We
        will take reasonable steps to ensure that anyone processing your personal information outside
        your country of origin is required to implement measures to protect it and is only permitted
        to process it in accordance with our instructions.
      </LegalP>
      <LegalP>
        Many countries do not offer the same level of legal protection for personal information that
        you may enjoy in your home country. While your personal information is in another country, it
        may be accessed by the courts, law enforcement, and national security authorities of that
        country in accordance with its laws. However, we take reasonable precautions to keep your
        personal information secure and require any third parties who handle or process your personal
        information on our behalf to do likewise. Access to your personal information is restricted to
        prevent unauthorized access, modification, or misuse, and is only granted to our
        representatives and agents on a need-to-know basis.
      </LegalP>

      <LegalH2>Cookies</LegalH2>
      <LegalP>
        If you leave a comment on our website, you may opt in to saving your name, email address, and
        website in cookies. These are for your convenience so that you don&apos;t have to fill in your
        details again the next time you leave a comment. These cookies will last for one year. If you
        have an account and log in to this website, we will set a temporary cookie to determine
        whether your browser accepts cookies. This cookie contains no personal data and is discarded
        when you close your browser.
      </LegalP>
      <LegalP>
        When you log in, we will also set up several cookies to save your login information and your
        screen display choices. Login cookies last for two days, and screen options cookies last for a
        year. If you select &quot;Remember Me&quot;, your login will persist for about two weeks. If you log out
        of your account, the login cookies will be removed. If you edit or publish an article, an
        additional cookie will be saved in your browser. This cookie includes no personal data and
        simply indicates the post ID of the article you just edited. It expires after one day.
      </LegalP>

      <LegalH2>Media</LegalH2>
      <LegalP>
        If you upload images to the website, you should avoid uploading images with embedded location
        data (EXIF GPS) included. Visitors to the website can download and extract any location data
        from images on the website.
      </LegalP>

      <LegalH2>Embedded content from other websites</LegalH2>
      <LegalP>
        Articles on this website may include embedded content (e.g. videos, images, articles, etc.).
        Embedded content from other websites behaves in exactly the same way as if the visitor had
        visited the other website.
      </LegalP>
      <LegalP>
        These websites may collect data about you, use cookies, embed additional third-party tracking,
        and monitor your interaction with that embedded content, including tracking your interaction
        with the embedded content if you have an account and are logged in to that website.
      </LegalP>

      <LegalH2>Data sharing</LegalH2>
      <LegalP>
        If you leave a comment, the comment and its metadata are retained indefinitely. This is so we
        can recognize and approve any follow-up comments automatically instead of holding them in a
        moderation queue. For registered users of our website (if any), we also store the personal
        information they provide in their user profile. All users can see, edit, or delete their
        personal information at any time (except they cannot change their username). Website
        administrators can also view and edit that information. We will not share the data available
        with us with anyone under any circumstances.
      </LegalP>

      <LegalH2>In case of bankruptcy, sale, or merger</LegalH2>
      <LegalP>
        Ownership of the website may change at some point. Should that happen, we want this website to
        be able to maintain a relationship with you. In the event of a sale, merger, bankruptcy, or
        other change of ownership of APTICON 2026, your data may be shared with the person or business
        that acquires or controls this website. Opting out of receiving data from third parties will
        not affect our right to transfer your data to another owner, but your choices will continue to
        be respected with regard to the use of your data. You will be notified as described below in
        &quot;Changes to this Privacy Policy&quot;.
      </LegalP>

      <LegalH2>Changes to this Privacy Policy</LegalH2>
      <LegalP>
        If we decide to make changes or improvements to this policy, we will inform you by email (sent
        to the email address indicated in your account) or by means of a notice on this website before
        the change takes effect. We encourage you to periodically review this page for the latest
        information on our privacy practices.
      </LegalP>

      <LegalH2>Note on translated versions</LegalH2>
      <LegalP>
        For your convenience, APTICON 2026 may make translated versions of this Privacy Policy
        available on the website. If the terms of any such translated version conflict with the terms
        of the English version, the terms of the English version of this Privacy Policy will control
        in all cases.
      </LegalP>

      <LegalP>
        For any questions regarding this Privacy Policy, please contact us at{" "}
        <a href={`mailto:${EVENT.contact}`} className="text-[var(--crimson-800)] font-semibold hover:underline">
          {EVENT.contact}
        </a>
        . For details on registration cancellations and refunds, see our{" "}
        <Link href="/refund-policy" className="text-[var(--crimson-800)] font-semibold hover:underline">
          Refund &amp; Cancellation Policy
        </Link>
        .
      </LegalP>
    </LegalPageLayout>
  );
}
