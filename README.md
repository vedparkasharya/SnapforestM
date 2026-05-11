# SnapforestX - Creator Studio Booking Platform

> A production-grade, full-stack creator room booking platform built with Next.js 14, MongoDB, Razorpay Payments, and Google OAuth.

## What is this project?

SnapforestX is an **OYO-style creator studio booking platform** designed for Patna, Bihar. It allows creators (podcasters, YouTubers, musicians, photographers, dancers, gamers, streamers) to discover, search, filter, and book professional studio rooms by the hour or for a full day — with instant payment via Razorpay and email confirmations.

---

## Live Demo

8 AI-generated demo room images are included in `public/rooms/` for demonstration purposes. Run the seed API after connecting MongoDB to populate demo data.

---

## Complete Feature List

### Authentication
- [x] Google OAuth 2.0 login via NextAuth.js
- [x] Session management with JWT strategy
- [x] Role-based access (user / admin)
- [x] Route protection via middleware
- [x] Admin route guards

### Room Discovery
- [x] Browse all creator studios with responsive grid layout
- [x] **City filter** (Patna-based locations)
- [x] **Category filter** (podcast, youtube, music, photography, dance, coworking, gaming, streaming, meeting)
- [x] **Price range filter** (Under Rs. 500, Rs. 500-1000, Rs. 1000-2000, Above Rs. 2000)
- [x] **Text search** across room names, descriptions, and addresses
- [x] Featured rooms highlighted
- [x] Animated room cards with ratings and pricing

### Room Detail Page
- [x] OYO-style image gallery with thumbnail navigation
- [x] Room description, equipment list, capacity, address
- [x] Google Maps link integration
- [x] Sticky booking widget

### Booking Engine
- [x] **Hourly booking** with time slot picker (30-min intervals, 00:00-23:30)
- [x] **Daily booking** (full day) option
- [x] Date picker with past dates disabled
- [x] Dynamic price calculation based on duration
- [x] **Mandatory damage policy checkbox** (booking button disabled until checked)
- [x] **Slot availability checking** — prevents double bookings
- [x] **30-minute cleaning buffer** between bookings
- [x] **15-minute auto-expiry** for pending bookings
- [x] **Cancellation window** — can cancel up to 30 minutes before start time

### Payments (Razorpay)
- [x] Razorpay checkout popup integration
- [x] Payment verification with HMAC signature check
- [x] **Secure webhook handling** with signature verification
- [x] **Duplicate payment detection** and prevention
- [x] Booking auto-confirms after successful payment
- [x] Automatic room availability updates

### Email Notifications
- [x] **Professional HTML email** sent on booking confirmation
- [x] Includes: room name, address, date, time, amount, map link
- [x] Nodemailer SMTP integration (Gmail)

### User Dashboard
- [x] View all personal bookings
- [x] **Tabbed view**: Upcoming | Past | Cancelled
- [x] Booking cancellation with time restriction
- [x] Payment status badges
- [x] Empty states for each tab
- [x] Success toast after payment redirect

### Admin Dashboard
- [x] Protected admin-only route
- [x] Revenue statistics cards (Total Bookings, Revenue, Pending Refunds, Occupancy Rate)
- [x] All bookings table with user and room details
- [x] **Room creation form** with all fields
- [x] Refund processing for cancelled paid bookings
- [x] Role-based route protection

### Technical Features
- [x] Next.js 14 App Router
- [x] TypeScript throughout
- [x] Tailwind CSS with custom dark theme (neon cyan/purple accent)
- [x] Framer Motion animations
- [x] Responsive mobile-first design
- [x] Glass-morphism UI cards
- [x] Loading skeletons
- [x] Error boundaries with retry
- [x] Zod schema validation
- [x] MongoDB connection caching
- [x] Optimized image handling

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Lucide React |
| UI Components | Custom shadcn/ui-inspired components (Button, Card, Badge, Dialog, Tabs, Select, Input, Skeleton) |
| Backend | Next.js API Routes, Server Actions |
| Database | MongoDB Atlas + Mongoose ODM |
| Auth | NextAuth.js with Google OAuth 2.0 |
| Payments | Razorpay (Checkout + Webhooks) |
| Email | Nodemailer (Gmail SMTP) |
| Validation | Zod |

---

## Project Structure

```
src/
 app/
   page.tsx                  # Home page (Hero + RoomList)
   layout.tsx                # Root layout with Navbar, Footer, AuthProvider
   loading.tsx               # Global loading state
   error.tsx                 # Global error boundary
   rooms/
     page.tsx                # All rooms listing with filters
     [slug]/
       page.tsx              # Room detail with image gallery + booking widget
       book/
         page.tsx            # Redirect to room detail
   dashboard/
     page.tsx                # User bookings dashboard
   admin/
     page.tsx                # Admin dashboard (stats, bookings, room creation)
   api/
     auth/[...nextauth]/
       route.ts              # NextAuth Google OAuth handler
     rooms/
       route.ts              # GET rooms (with filters)
     bookings/
       route.ts              # POST create booking + GET user bookings
       verify/
         route.ts            # POST verify Razorpay payment
       cancel/
         route.ts            # POST cancel booking
     webhook/
       route.ts              # POST Razorpay webhook handler
     seed/
       route.ts              # GET seed demo rooms into MongoDB
     admin/
       rooms/
         route.ts            # POST create room (admin)
       bookings/
         route.ts            # GET all bookings (admin)
         refund/
           route.ts          # POST process refund (admin)
       revenue/
         route.ts            # GET revenue statistics (admin)
 components/
   ui/                       # Reusable UI components
   layout/                   # Navbar, Footer
   rooms/                    # Hero, RoomCard, RoomList, FilterBar
   booking/                  # BookingWidget
 lib/
   utils.ts                  # Formatting, pricing, date utilities
   db.ts                     # MongoDB connection with caching
   api-response.ts           # Standardized API response helpers
   email.ts                  # Nodemailer email service
 models/
   User.ts                   # User schema
   Room.ts                   # Room schema
   Booking.ts                # Booking schema
 types/
   index.ts                  # Zod schemas + TypeScript interfaces
 providers/
   AuthProvider.tsx          # NextAuth session provider
   ThemeProvider.tsx         # Dark theme provider
 middleware.ts               # Route protection (admin + auth)
public/
  rooms/                     # 8 demo room images
```

---

## Environment Variables

Create a `.env.local` file in the root directory. **Never commit this file.**

```env
# --- MongoDB ---
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snapforestx?retryWrites=true&w=majority

# --- NextAuth ---
NEXTAUTH_SECRET=your_super_secret_random_string
NEXTAUTH_URL=http://localhost:3000

# --- Google OAuth ---
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# --- Razorpay ---
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# --- Cloudinary ---
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_PRESET=your_upload_preset

# --- Email (Gmail SMTP) ---
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# --- App ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### How to get each variable:

| Variable | How to Obtain |
|----------|--------------|
| `MONGODB_URI` | Create free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas). Whitelist 0.0.0.0/0 for all IPs. |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` in terminal |
| `GOOGLE_CLIENT_ID/SECRET` | [Google Cloud Console](https://console.cloud.google.com) > APIs & Services > Credentials > OAuth 2.0 Client |
| `RAZORPAY_KEY_ID/SECRET` | [Razorpay Dashboard](https://dashboard.razorpay.com) > Account & Settings > API Keys (Test Mode) |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard > Webhooks > Add webhook endpoint |
| `SMTP_USER/PASS` | Gmail > Manage Account > Security > 2-Step Verification > App Passwords |

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Google OAuth credentials
- Razorpay test account

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/SnapforestM.git
cd SnapforestM
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.local.example .env.local
# Edit .env.local with all your actual values
```

### 3. Run Development Server

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Seed Demo Data

After setting `MONGODB_URI`, visit: `http://localhost:3000/api/seed`

This will insert 8 Patna-based demo rooms into your MongoDB database.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## Deploy on Vercel

### Step-by-step:

1. **Push to GitHub** (repo should not include `.env.local`)
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add all environment variables from `.env.local` in Vercel Dashboard > Settings > Environment Variables
4. Deploy!

### Post-Deployment Setup:

1. **Update Google OAuth Redirect URI**:
   - Add `https://your-domain.vercel.app/api/auth/callback/google`
   - Also add `https://your-domain.vercel.app` as authorized origin

2. **Setup Razorpay Webhook**:
   - Endpoint: `https://your-domain.vercel.app/api/webhook`
   - Events: `payment.captured`
   - Copy webhook secret to `RAZORPAY_WEBHOOK_SECRET`

3. **Seed Database**:
   - Visit `https://your-domain.vercel.app/api/seed` once

---

## API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rooms?city=&category=&minPrice=&maxPrice=&search=` | List/filter rooms | No |
| GET | `/api/rooms?slug=` | Get single room | No |
| POST | `/api/bookings` | Create booking + Razorpay order | Yes |
| GET | `/api/bookings` | Get user's bookings | Yes |
| POST | `/api/bookings/verify` | Verify payment | Yes |
| POST | `/api/bookings/cancel` | Cancel booking | Yes |
| POST | `/api/webhook` | Razorpay webhook | No (signature check) |
| GET | `/api/seed` | Seed demo rooms | No |
| POST | `/api/admin/rooms` | Create room | Admin |
| GET | `/api/admin/bookings` | Get all bookings | Admin |
| POST | `/api/admin/bookings/refund` | Process refund | Admin |
| GET | `/api/admin/revenue` | Revenue stats | Admin |

---

## 8 Demo Rooms (Patna Locations)

| # | Name | Category | Area | Price/Hour |
|---|------|----------|------|------------|
| 1 | Patna Podcast Hub | Podcast | Boring Road | Rs. 499 |
| 2 | CreatorStudioX YouTube Setup | YouTube | Kankarbagh | Rs. 599 |
| 3 | Patna Sound Lab | Music | Fraser Road | Rs. 699 |
| 4 | SnapStudio Photo Lab | Photography | Gardanibagh | Rs. 449 |
| 5 | DanceFloor Patna | Dance | Rajendra Nagar | Rs. 399 |
| 6 | Patna Creators Hub | Coworking | Dak Bungalow | Rs. 349 |
| 7 | GameZone Pro Streaming | Gaming | Bailey Road | Rs. 549 |
| 8 | LiveStream Studio Patna | Streaming | Patliputra | Rs. 649 |

All rooms are filterable by city (Patna), category, and price range.

---

## Admin Access

To make a user admin:

1. Have the user sign in with Google first
2. In MongoDB Atlas, find the user in the `users` collection
3. Change `role` from `"user"` to `"admin"`
4. The user must sign out and sign in again

---

## Razorpay Test Cards

Use these for testing payments in Razorpay test mode:

| Card Number | CVV | Expiry | OTP |
|-------------|-----|--------|-----|
| 5267 3181 8797 5449 | Any 3 digits | Any future date | 1234 |

---

## Important Security Notes

- **Never commit `.env.local`** — it contains all API secrets. It is already in `.gitignore`.
- The `.env.local.example` file shows which variables are needed without real values.
- Razorpay webhook signatures are verified cryptographically to prevent tampering.
- Duplicate payment events from Razorpay are detected and rejected.
- Admin routes are protected by middleware and API checks.
- MongoDB queries use parameterized inputs (Mongoose built-in).

---

## Future Enhancements

- [ ] Cloudinary image upload (admin can upload room images)
- [ ] Review and rating system
- [ ] Multi-city support beyond Patna
- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio)
- [ ] Advanced analytics for admin

---

## License

MIT

---

**Built with for Patna Creators**
# redeploy
# deploy Tue May 12 02:15:10 IST 2026
# deploy Tue May 12 02:16:31 IST 2026
# deploy Tue May 12 02:18:28 IST 2026
# fix
# final Tue May 12 02:50:52 IST 2026
