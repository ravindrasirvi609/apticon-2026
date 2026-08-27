This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

## WhatsApp notifications

Registration webhook notifications use Sendrix. Configure these server-only environment variables:

```bash
SENDRIX_CALLBACK_URL=https://sendrixbackend.exebee.com/webhook/wa/BjuMKmyATxnYiUk9pGEUXUAq
SENDRIX_VERIFY_TOKEN=your-sendrix-verify-token
```

WhatsApp notifications use Interakt's approved template API. Configure these server-only environment variables:

```bash
INTERAKT_API_KEY=your-interakt-api-key
INTERAKT_TEMPLATE_LANGUAGE=en
INTERAKT_TEMPLATE_REGISTRATION_APPROVED=your_approved_template_name
INTERAKT_TEMPLATE_ABSTRACT_SUBMITTED=your_submitted_template_name
INTERAKT_TEMPLATE_ABSTRACT_DECISION=your_decision_template_name
INTERAKT_TEMPLATE_ABSTRACT_RESUBMITTED=your_resubmitted_template_name
INTERAKT_TEMPLATE_GROUP_REGISTRATION_SUBMITTED=your_group_submitted_template_name
INTERAKT_TEMPLATE_GROUP_REGISTRATION_APPROVED=your_group_approved_template_name
INTERAKT_TEMPLATE_GROUP_REGISTRATION_REJECTED=your_group_rejected_template_name
INTERAKT_TEMPLATE_NUDGE_ABSTRACT=your_abstract_nudge_template_name
INTERAKT_TEMPLATE_NUDGE_REGISTER=your_registration_nudge_template_name
```

Each template must be approved in Interakt and its body variables must match the notification. An unset template disables only that WhatsApp notification; email and the underlying operation continue normally.

## Razorpay payment setup

The registration flow uses Razorpay Standard Checkout only; it does not accept bank-transfer details or payment-proof uploads.

Set these server-only environment variables in the deployment environment (and in `.env.local` for development):

```bash
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=use-a-separate-long-random-secret
```

In Razorpay Dashboard, enable automatic capture and add this webhook endpoint for both Test and Live mode:

```text
https://YOUR-DOMAIN/api/payments/razorpay/webhook
```

Subscribe to `payment.captured`, `payment.authorized`, `payment.failed`, and `payment.refunded`. Test the complete flow with test keys before replacing them with Live keys. The key secret and webhook secret must never be exposed to the browser or committed to source control.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
