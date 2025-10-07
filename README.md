## Environment Variables

Configure the following in your `.env` files:

Frontend (root `.env.local` or environment):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

Backend (in `backend/.env`):

### SMTP (Email)
- `SMTP_HOST` — SMTP server host
- `SMTP_PORT` — SMTP server port (e.g., 587)
- `SMTP_SECURE` — `true` to use TLS, otherwise `false`
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password

The backend verifies SMTP on startup and falls back to console logging if not configured.

### Cloudinary
- `CLOUDINARY_CLOUD_NAME` — Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` — Cloudinary API key
- `CLOUDINARY_API_SECRET` — Cloudinary API secret

Cloudinary is initialized at server startup and used by upload endpoints.
# Job Portal

## Setup

1. Copy `.env.example` to `.env` in backend (and root if applicable) and fill values.
2. Install dependencies: `pnpm install` or `npm install`.
3. Run backend: `cd backend && npm run dev`.
4. Run frontend: `npm run dev`.

## Environment Variables

See `.env.example` (root) or `backend/.env.example` for variables including Stripe price IDs per billing cycle, JWT secrets, Twilio (SMS/WhatsApp), SMTP, VAPID, and API URL.

Required keys (non-exhaustive):
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CLIENT_URL`, price IDs per plan/cycle:
  - `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_QUARTERLY`, `STRIPE_PRICE_PRO_YEARLY`
  - `STRIPE_PRICE_ENTERPRISE_MONTHLY`, `STRIPE_PRICE_ENTERPRISE_QUARTERLY`, `STRIPE_PRICE_ENTERPRISE_YEARLY`
- Twilio: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, optional `TWILIO_WHATSAPP_NUMBER` (format `whatsapp:+E164`)
- Web Push (VAPID): `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (e.g., `mailto:admin@example.com`)
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`
- Auth: `JWT_SECRET`, `REFRESH_TOKEN_SECRET`

## Payments (Stripe, Razorpay, PayPal)

- Feature flags: `ENABLE_RAZORPAY=true`, `ENABLE_PAYPAL=true`.
- Stripe env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, plan price IDs per billing cycle.
- Razorpay env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`.
- PayPal env: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV=sandbox|live`.
- Webhook endpoints:
  - Stripe: `POST /api/subscriptions/webhooks/stripe`
  - Razorpay: `POST /api/subscriptions/webhooks/razorpay`
  - PayPal: `POST /api/subscriptions/webhooks/paypal`
- Customer portal: `POST /api/subscriptions/portal`
- Success URL: `${CLIENT_URL}/checkout/success`

## Subscriptions

- Daily cron handles trial expiry, grace periods, cancellations, renewal reminders, promotion expiries.
- Usage limits enforced for job views and applications via middleware (`checkJobViewAccess`, `checkApplicationAccess`).

## OTP Login

- OTP via email or SMS supported. Routes: `/api/auth/send-otp`, `/api/auth/verify-otp`, `/api/auth/resend-otp`.
 - After verification, client persists `{ token, refreshToken, user }` to the auth context.

## Admin

- Admin moderation workflow is available in the admin UI. Use the Admin dashboard to moderate jobs; audit logging endpoints expose moderation history.

## Webhooks

- Stripe: configure webhook to `POST /api/billing/stripe/webhook`. The invoice handler expands PaymentIntent to extract card last4 via `payment_method`.

## Testing

- Integration tests for subscription flow live under `backend/src/tests/integration`.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## Backend database seeding

To populate the backend with sample data reflecting the latest models (including bids with succeeded, pending, and failed payments):

```bash
cd backend
npm run seed
```

This wipes existing collections and recreates users, jobs, profiles, services, bids, orders, applications, reviews, conversations, and notifications.