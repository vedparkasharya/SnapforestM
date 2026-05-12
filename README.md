# SnapforestX

India's first creator-focused studio booking platform. Book professional creator studios, podcast rooms, gaming setups, YouTube studios, and more on an hourly basis.

## What is SnapforestX?

SnapforestX is a full-stack web application that allows content creators, influencers, podcasters, YouTubers, gamers, streamers, and social media creators to find and book professional creator spaces/studios on an hourly or daily basis. Think of it as an Airbnb or OYO but exclusively for creators — not hotels, not generic rooms, but purpose-built creator studios.

## What I Built

### Platform Features

- **Home Page**: Hero section with search, 16 creator categories, featured studios from Patna, how-it-works section, platform features, and CTA
- **Creator Studios Listing**: Filter by category, city, price range. Sort by price, rating, newest. 20 demo rooms across Patna locations
- **Studio Detail Page**: Image gallery, equipment showcase, features, availability schedule, sticky booking widget with date/time slot selection
- **Booking System**: Date/time selection, 30-min cleaning buffer, real-time availability check, Razorpay payment integration, booking confirmation email
- **User Dashboard**: My Bookings page with all booking history, status, and details
- **Admin Dashboard**: Protected admin panel with stats (total bookings, rooms, users, revenue), recent bookings, booking status distribution, studio management, and booking management
- **Authentication**: Google OAuth via NextAuth with role-based access (user/admin)
- **Damage Policy Page**: Complete studio rules and damage policy

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB Atlas |
| ORM | Mongoose |
| Auth | NextAuth.js (Google OAuth) |
| Payments | Razorpay |
| Media | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| UI Icons | Lucide React |
| Deployment | Vercel |

### Project Structure

```
src/
  app/                     # Next.js App Router pages
    api/                   # API Routes
      auth/[...nextauth]/  # NextAuth configuration
      rooms/               # Room CRUD APIs
      bookings/            # Booking CRUD APIs
      payment/             # Razorpay payment APIs
      admin/               # Admin dashboard APIs
      seed/                # Database seeding
    rooms/                 # Studios listing page
    rooms/[id]/            # Studio detail page
    bookings/              # My bookings page
    admin/                 # Admin dashboard
    admin/rooms/           # Admin studio management
    admin/bookings/        # Admin booking management
    login/                 # Sign in page
    policy/                # Damage policy page
  components/              # Reusable components
    Navbar.tsx             # Navigation bar
    Footer.tsx             # Footer
    RoomCard.tsx           # Studio card component
  lib/                     # Utility functions
    mongodb.ts             # MongoDB connection
    auth.ts                # NextAuth config
    email.ts               # Email service
    cloudinary.ts          # Cloudinary config
    razorpay.ts            # Razorpay service
  models/                  # Mongoose models
    User.ts                # User model
    Room.ts                # Room/Studio model
    Booking.ts             # Booking model
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | Google OAuth authentication |
| `/api/rooms` | GET | List all studios (with filters) |
| `/api/rooms/[id]` | GET | Get studio details |
| `/api/rooms/[id]/availability` | GET | Check time slot availability |
| `/api/bookings` | GET | Get user bookings |
| `/api/bookings` | POST | Create a booking |
| `/api/payment/create-order` | POST | Create Razorpay order |
| `/api/payment/verify` | POST | Verify payment signature |
| `/api/admin/dashboard` | GET | Admin dashboard stats |
| `/api/admin/rooms` | GET/POST | Admin room management |
| `/api/admin/bookings` | GET | Admin booking list |
| `/api/seed` | GET | Seed demo data |

### Demo Data (Patna Locations)

20 creator studios seeded across Patna with real locations:

1. Neon Glow Creator Studio (Boring Road) - Rs. 299/hr
2. Pro Podcast Hub Patna (Kankarbagh) - Rs. 399/hr
3. Gaming Arena X (Fraser Road) - Rs. 449/hr
4. YouTube Creator Studio (Rajendra Nagar) - Rs. 499/hr
5. Aesthetic Vibes Studio (Sri Krishna Puri) - Rs. 349/hr
6. Product Shoot Pro (Patliputra Colony) - Rs. 379/hr
7. Reel Factory (Bailey Road) - Rs. 249/hr
8. Green Screen Studio (Gandhi Maidan) - Rs. 429/hr
9. Music Recording Lab (Ashok Rajpath) - Rs. 549/hr
10. Live Stream Central (Dak Bungalow) - Rs. 479/hr
11. Tech Review Lab (Hajipur Road) - Rs. 329/hr
12. Fashion Shoot Studio (Anandpuri) - Rs. 549/hr
13. Couple Creator Suite (Keshri Nagar) - Rs. 379/hr
14. Selfie Point X (Boring Road) - Rs. 199/hr
15. AI Creator Workspace (SP Verma Road) - Rs. 419/hr
16. Startup Pitch Room (Gandhi Maidan) - Rs. 599/hr
17. Interview Studio Pro (Frazer Road) - Rs. 449/hr
18. Cinematic Video Lab (Lokanayak Ganga Path) - Rs. 649/hr
19. Unbox Studio (Kankarbagh) - Rs. 279/hr
20. Brand Collab Studio (Boring Road) - Rs. 699/hr

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# MongoDB Atlas
# Get your connection string from: https://cloud.mongodb.com
# Format: mongodb+srv://username:password@cluster.mongodb.net/snapforestx
MONGODB_URI=your_mongodb_atlas_connection_string

# NextAuth.js
# Generate a random secret: openssl rand -base64 32
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
# Create credentials at: https://console.cloud.google.com/apis/credentials
# Authorized redirect URI: http://localhost:3000/api/auth/callback/google
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Razorpay Payment Gateway
# Get keys from: https://dashboard.razorpay.com/app/keys
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Cloudinary
# Get credentials from: https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_UPLOAD_PRESET=snapforestx_rooms

# SMTP Email (Gmail)
# Use App Password from: https://myaccount.google.com/apppasswords
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Google Cloud Console project with OAuth credentials
- Razorpay account (for payments)
- Cloudinary account (for image uploads)
- Gmail account with App Password (for emails)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/SnapforestM.git
   cd SnapforestM
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual credentials
   ```

4. **Seed the database (optional - creates 20 demo studios in Patna)**
   ```bash
   # Start the dev server first
   npm run dev
   # Then visit: http://localhost:3000/api/seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Build for production**
   ```bash
   npm run build
   npm start
   ```

### Deployment (Vercel)

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

### What You Need to Do After Cloning

1. **Set up MongoDB Atlas**: Create a cluster, get your connection string, and add it to `MONGODB_URI`
2. **Set up Google OAuth**: Go to Google Cloud Console, create OAuth credentials, add authorized redirect URIs
3. **Set up Razorpay**: Create an account, get test/live keys
4. **Set up Cloudinary**: Create an account, get cloud name, API key, and API secret
5. **Set up Gmail SMTP**: Generate an App Password for your Gmail account
6. **Seed the database**: Visit `/api/seed` after starting the server to create demo studios
7. **Set admin role**: Manually update a user's role to `admin` in MongoDB to access the admin dashboard

## Security Notes

- **Never commit `.env.local` to Git** - it contains sensitive credentials
- **Never expose API keys in client-side code** - use `NEXT_PUBLIC_` prefix only for necessary keys
- **Razorpay webhook secret** should be kept secure and used for signature verification
- **NextAuth secret** should be a strong random string in production
- **MongoDB connection string** should use a dedicated database user with limited permissions

## Creator Studio Categories

- Content Creation Room
- Podcast Studio
- Interview Studio
- Gaming & Streaming Room
- Selfie Point Room
- Instagram Reel Room
- YouTube Creator Studio
- Luxury Aesthetic Room
- Editing Setup Room
- Photography Studio
- Cinematic Video Studio
- Couple Creator Room
- Product Shoot Room
- Green Screen Studio
- Tech Review Setup
- Fashion Shoot Room
- Neon RGB Creator Room
- Music Recording Room
- Live Streaming Studio
- Unboxing Creator Room
- Startup Pitch Room
- Brand Collaboration Room
- AI Creator Workspace
- Virtual Production Room

## License

This project is built for demonstration purposes.

---

Built with Next.js 14, MongoDB, and Tailwind CSS.
