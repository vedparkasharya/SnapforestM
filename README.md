# Snapforest — Creator Studio Booking Platform

Snapforest is a full-stack creator-space booking app built with Next.js 14, TypeScript, MongoDB, Razorpay and Google OAuth. It is focused on helping creators find a suitable room in Patna, compare the setup, choose a slot and complete a booking.

## What it includes

- Room discovery with category, city, price and text filters
- Room pages with images, equipment, capacity, address and booking flow
- Hourly and daily booking options
- Server-side booking amount calculation
- Razorpay checkout and signed payment verification
- Razorpay webhook handling with idempotent confirmation
- Authenticated user/admin sessions backed by signed server tokens
- User booking history and cancellation controls
- Admin booking, room and refund tooling
- Responsive UI with loading, empty and error states
- Zod validation, Mongoose models and reusable UI components

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Next.js Route Handlers |
| Database | MongoDB + Mongoose |
| Auth | Custom signed token flow + Google OAuth integration |
| Payments | Razorpay Checkout + Webhooks |
| Email | Nodemailer |
| Validation | Zod |

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB
- Razorpay account for real payments
- OAuth credentials when social login is enabled

### Install

```bash
git clone https://github.com/vedparkasharya/SnapforestM.git
cd SnapforestM
npm install
```

Create `.env.local` from `.env.local.example` and add your own values. Never commit secrets.

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment variables

At minimum, production needs a strong `AUTH_SECRET` (or `NEXTAUTH_SECRET`) with at least 32 characters and the database/payment variables used by the enabled features.

```env
MONGODB_URI=...
AUTH_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
SMTP_USER=...
SMTP_PASS=...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development only, optional
ALLOW_DEMO_PAYMENTS=true
SEED_SECRET=...
```

Do not use demo payments in production. The application rejects demo checkout in production even when the demo flag is enabled.

## Seeding development data

The seed route is intentionally disabled in production and requires `SEED_SECRET` during development:

```powershell
$headers = @{ "x-seed-secret" = $env:SEED_SECRET }
Invoke-RestMethod -Method Get -Uri "http://localhost:3000/api/seed" -Headers $headers
```

The seed endpoint creates room data only. It does not create admin accounts or embed passwords in source code.

## API overview

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| GET | `/api/rooms` | List/filter rooms | Public |
| GET | `/api/rooms?slug=...` | Get a room | Public |
| POST | `/api/bookings` | Create booking/order | Guest allowed |
| GET | `/api/bookings` | Get own bookings, or all bookings for admin | Signed token |
| POST | `/api/bookings/verify` | Verify payment and confirm booking | Payment callback data validated server-side |
| POST | `/api/bookings/cancel` | Cancel an eligible booking | Owner or admin |
| POST | `/api/webhook` | Process Razorpay payment events | Razorpay signature |
| POST | `/api/admin/rooms` | Create a room | Admin |
| GET | `/api/admin/bookings` | Admin booking list | Admin |
| POST | `/api/admin/bookings/refund` | Process refund | Admin |
| GET | `/api/admin/revenue` | Revenue statistics | Admin |

## Security notes

- Client-supplied booking prices are not trusted; the server derives the amount from room pricing and booking duration.
- Public access to `/api/bookings` is blocked to prevent exposing guest information.
- Booking cancellation requires an authenticated owner or admin.
- A cancelled/completed booking cannot be resurrected by a payment callback.
- Razorpay webhook and payment signatures are compared with timing-safe checks.
- Repeated payment callbacks are handled idempotently.
- The app no longer contains a fallback authentication secret or hard-coded seed passwords.
- Rate limiting in the current implementation is process-local; use a shared store for horizontally scaled deployments.

## Product notes

Room listings should contain real, verified business information. Avoid publishing placeholder reviews, invented partner logos, or unverified service guarantees.

The UI uses a restrained dark/forest visual system with responsive controls, clear states and reduced-motion support.

## License

MIT
