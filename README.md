# IGNITE 2026 - Event Management Platform

A comprehensive, production-ready web application for managing the IGNITE 2026 innovation event. Built with Next.js 14+, TypeScript, Tailwind CSS, and MongoDB, designed for serverless deployment on Netlify.

## 🚀 Features

### Public Features (No Login Required)
- **Team Registration**: Register up to 8 members per team with project details
- **Accommodation Booking**: Book rooms with food preferences
- **Auto-generated Coupons**: Lunch and tea coupons for each team member

### Role-Based Dashboards (Google OAuth)

| Role | Access |
|------|--------|
| **Super Admin** | Full system access, manage all admins |
| **Accommodation Admin** | View/manage bookings, guest counts |
| **Food Admin** | Verify coupons, track usage, manage menu |
| **Commute Admin** | Manage bus schedules and routes |
| **Venue Admin** | Publish announcements, venue info |
| **Jury Admin** | Manage questions, assign teams, export results |
| **Jury Member** | Evaluate assigned projects |
| **Volunteer** | View announcements, schedules, venue info |

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5 (Auth.js) with Google OAuth
- **Database**: MongoDB with Mongoose
- **Deployment**: Netlify (Serverless Functions)

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google Cloud Console project (for OAuth)
- Netlify account

### 1. Clone and Install

```bash
git clone <repository-url>
cd Ignite
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ignite-event

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret

# First Super Admin
SUPER_ADMIN_EMAIL=admin@example.com
```

### 3. MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a database user
3. Add your IP to the whitelist (or allow all IPs for Netlify)
4. Copy the connection string to `MONGODB_URI`

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://your-domain.netlify.app/api/auth/callback/google` (production)

### 5. Seed Initial Data

```bash
npm run seed
```

This creates:
- Super admin user (using `SUPER_ADMIN_EMAIL`)
- Default evaluation questions
- Venue information

### 6. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Netlify Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Netlify

1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

### 3. Environment Variables

Add all environment variables from `.env.local` to Netlify:
- Site settings → Environment variables

**Important**: Update `NEXTAUTH_URL` to your Netlify domain.

### 4. Deploy

Netlify will automatically deploy on push to main branch.

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/           # Public pages
│   │   ├── page.tsx        # Landing page
│   │   ├── register/       # Team registration
│   │   └── accommodation/  # Booking
│   ├── admin/              # Admin dashboards
│   │   ├── page.tsx        # Super admin
│   │   ├── users/          # User management
│   │   ├── accommodation/  # Booking admin
│   │   ├── food/           # Food/coupon admin
│   │   ├── commute/        # Bus schedule admin
│   │   └── venue/          # Venue/announcements
│   ├── jury/               # Jury system
│   │   ├── page.tsx        # Jury admin
│   │   ├── questions/      # Question management
│   │   └── evaluate/       # Jury member evaluation
│   ├── volunteer/          # Volunteer dashboard
│   ├── actions/            # Server actions
│   └── api/auth/           # NextAuth routes
├── components/
│   ├── forms/              # Form components
│   ├── ui/                 # UI components
│   ├── Navbar.tsx
│   └── Providers.tsx
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── auth-utils.ts       # Auth helpers
│   ├── mongodb.ts          # DB connection
│   └── utils.ts            # Utility functions
├── models/                 # Mongoose models
├── types/                  # TypeScript types
└── middleware.ts           # Route protection
```

## 🔐 Security Features

- JWT-based session management
- Role-based access control (RBAC)
- Protected API routes and pages
- Input validation with Zod
- Sanitized user inputs
- Secure environment variable handling

## 📝 Adding First Super Admin

1. Set `SUPER_ADMIN_EMAIL` in your environment variables
2. Run `npm run seed`
3. Login with Google using that email
4. You now have full admin access

## 🧪 Testing

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build
```

## 📅 Event Details

- **Event Date**: February 28, 2026
- **Accommodation Dates**: February 27 - March 1, 2026
- **Max Team Size**: 8 members

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License - see LICENSE file for details.