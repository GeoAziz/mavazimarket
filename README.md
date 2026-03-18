
# 🎨 Mavazi Market - Afrocentric E-Commerce Platform

> **Bold. Culturally Authentic. Performance-Engineered.**

Mavazi Market is a sophisticated, full-stack fashion e-commerce platform celebrating African heritage and serving the Kenyan shopper with cultural pride. Built with Next.js 15, Firebase, and cutting-edge AI capabilities—designed from the ground up for the East African market.

**Version:** 1.0 | **Status:** Production-Ready | **Last Updated:** March 2026

---

## 📋 Table of Contents

- [Vision & Mission](#vision--mission)
- [Key Features](#key-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#project-architecture)
- [Quick Start](#-quick-start)
- [Environment Configuration](#environment-configuration)
- [Project Structure](#project-structure)
- [Core Features in Depth](#core-features-in-depth)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment Guide](#deployment-guide)
- [Performance Optimizations](#performance-optimizations)
- [Security & Best Practices](#security--best-practices)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Vision & Mission

### The Problem
Kenya's fashion market is fragmented. Buyers navigate generic global platforms (Jumia, Kilimall) built without Kenyan context:
- No native M-Pesa integration at checkout
- Westernized product catalogs that underrepresent African brands
- Poor mobile experiences for 3G/4G networks
- No cultural pride or local aesthetic

### Our Solution
Mavazi Market (*mavazi* = clothing in Swahili) solves this by:
- ✅ **Native M-Pesa Integration** — STK Push checkout, no middlemen
- ✅ **Cultural Relevance** — Kitenge, Masai-inspired, and Afrocentric categories as first-class features
- ✅ **Kenya-First Design** — Mobile-optimized for actual Kenyan network conditions
- ✅ **Local Pride** — Bold, confidence-driven brand that reflects African style
- ✅ **Seamless UX** — Cart persistence, order tracking, wishlist management

### Target Audience
- **Primary:** Urban Kenyans (18–35) in Nairobi, Mombasa, Kisumu — mobile-first, style-conscious, M-Pesa users
- **Secondary:** Fashion-conscious parents (28–45) shopping for family
- **Tertiary:** Kenyan diaspora and international shoppers interested in authentic African fashion

---

## 🚀 Key Features

### 1. **E-Commerce Core**
- **Product Catalog** — Men, Women, Kids categories with smart filtering (price, size, color, material, brand)
- **Product Discovery** — Search, featured collections, new arrivals, sale sections
- **Product Management** — High-resolution image carousel, detailed specs, customer reviews & ratings
- **Shopping Cart** — Real-time persistence (local + Firestore sync), persistent wishlist management
- **Checkout Flow** — Multi-step, form validation, address management, order summary

### 2. **Payment Integration**
- **M-Pesa STK Push** — Native Safaricom Daraja 2.0 integration with callback handling
- **Stripe/Card Payments** — Crypto-secure card processing
- **PayPal Support** — International payment option for diaspora
- **Payment Tracking** — Transaction IDs, status monitoring, failure recovery

### 3. **User Management**
- **Firebase Auth** — Email/password signup, login, password reset
- **User Profiles** — Shipping addresses, saved preferences, order history
- **Wishlist** — Guest wishlists (LocalStorage) auto-merged on login
- **Admin Escalation** — Admin role detection via email, Firestore rules-enforced

### 4. **AI-Powered Features**
- **Style Advisor** — Google Genkit + Gemini 2.0 Flash integration
  - Personalized fashion recommendations based on body type, skin tone, occasion
  - Context-aware styling tips using Kenyan fashion sensibilities
  - Real-time streaming responses

### 5. **Admin Dashboard**
- **Analytics** — Real-time dashboards, conversion tracking, revenue metrics
- **Product Management** — CRUD operations, bulk uploads, visibility toggles
- **Category Management** — Subcategories, pricing ranges, image management
- **Order Management** — Order status tracking, payment verification, fulfillment
- **Customer Management** — User search, profile viewing, purchase history
- **Settings & Appearance** — Theme configuration, brand settings

### 6. **Mobile-First Experience**
- **Responsive Design** — Touch-optimized for mobile-first workflows
- **Performance** — Image optimization, code splitting, lazy loading
- **Cart CTA Sticky** — Persistent, frictionless add-to-cart action
- **Hamburger Navigation** — Low-bandwidth-friendly navigation patterns

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 15** (App Router) | Server-side rendering, static generation, API routes |
| **React 18** | Component library, hooks, context API |
| **TypeScript 5** | Type-safe development, better DX |
| **Tailwind CSS 3** | Utility-first styling, Afrocentric color system |
| **shadcn/ui** | Accessible, pre-built UI components (Radix UI) |
| **Framer Motion** | Smooth animations, micro-interactions |
| **Zustand** | Lightweight state management (cart, UI state) |
| **React Hook Form** | Performant form handling, validation |
| **Recharts** | Analytics dashboards and charts |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless backend functions |
| **Firebase Admin SDK** | Server-side Firebase operations |
| **Firestore** | Real-time NoSQL database (collections, rules-based access) |
| **Firebase Authentication** | Auth state management, security |
| **Firebase Storage** | Secure image/media hosting |
| **Vercel** | Deployment, edge functions, serverless infrastructure |

### Payment & External APIs
| Service | Purpose |
|---|---|
| **Safaricom Daraja 2.0** | M-Pesa STK Push integration |
| **Stripe API** | Card payment processing |
| **PayPal** | International payments |
| **Google Genkit + Gemini** | AI-powered style advisor |
| **Resend** | Transactional email delivery |

### Development Tools
| Tool | Purpose |
|---|---|
| **tsx** | TypeScript execution in Node.js |
| **Genkit CLI** | AI flow development & testing |
| **Vercel CLI** | Deployment management |
| **ESLint** | Code quality enforcement |

---

## 📐 Project Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React/Next.js)                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pages (Catalog, Product, Cart, Checkout, Admin)    │   │
│  │ Components (UI, Products, Layout, Admin)           │   │
│  │ State (Zustand Stores, Context APIs)               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
        ┌────────────────────────────────────────────┐
        │   Next.js Server (App Router + API Routes) │
        │  ┌────────────────────────────────────────┐ │
        │  │ Server Components                      │ │
        │  │ Server Actions (mutations)             │ │
        │  │ API Routes (payments, auth webhooks)   │ │
        │  └────────────────────────────────────────┘ │
        └────────────────────────────────────────────┘
            ↕                          ↕
    ┌──────────────────┐    ┌─────────────────────────┐
    │  Firebase Stack  │    │  External APIs          │
    │ ┌──────────────┐ │    │ ┌─────────────────────┐ │
    │ │ Firestore    │ │    │ │ Daraja (M-Pesa)     │ │
    │ │ Auth         │ │    │ │ Stripe              │ │
    │ │ Storage      │ │    │ │ Genkit/Gemini       │ │
    │ │ Rules Engine │ │    │ │ Resend              │ │
    │ └──────────────┘ │    │ └─────────────────────┘ │
    └──────────────────┘    └─────────────────────────┘
```

### Data Flow Example: Add to Cart → Checkout → Payment

1. **Client Action** → User clicks "Add to Cart"
2. **Zustand Store Update** → Item added to local state + localStorage
3. **Firestore Sync** → If logged in, batch write to `users/{uid}/cartItems`
4. **Checkout** → Cart items fetched from Zustand, form submission
5. **Server Action** → `/app/checkout/actions.ts` processes payment
6. **Payment API** → Stripe/M-Pesa/PayPal → Webhook callback
7. **Order Creation** → Firestore order document created
8. **Email Notification** → Resend transactional email sent
9. **Client Redirect** → Order confirmation page with tracking

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (Recommended: 20 LTS)
- **npm 9+** or **yarn**
- Firebase project (free tier works fine to start)
- Service account key (.json) from Firebase

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/mavazi-market.git
cd mavazi-market

# 2. Install dependencies
npm install

# 3. Set up environment variables (see Environment Configuration)
cp .env.example .env.local
# Edit .env.local with your Firebase and API keys

# 4. Start development server (Turbopack enabled on port 9002)
npm run dev

# 5. In another terminal, start the AI development server (optional)
npm run genkit:dev

# 6. Open http://localhost:9002 in your browser
```

### Populate Sample Data (Optional)

```bash
# This requires FIREBASE_ADMIN_SDK_CONFIG_JSON in .env.local
npm run populate-db

# This will create:
# - 3 main categories (Men, Women, Kids)
# - 30 sample products
# - Sample subcategories with pricing ranges
```

### Build & Production

```bash
# Type check
npm run typecheck

# Build for production
npm run build

# Start production server
npm start

# With Vercel
vercel deploy --prod
```

---

## 🔐 Environment Configuration

### Required Environment Variables

| Variable | Type | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Public | Firebase API Key from project settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Public | Firebase auth domain (e.g., `mavazi-market.firebaseapp.com`) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Public | **CRITICAL:** Firebase project ID (e.g., `mavazi-market`) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Public | Firebase storage bucket URL |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Public | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Public | Firebase app ID |
| `FIREBASE_ADMIN_SDK_CONFIG_JSON` | Secret | Entire service account JSON (as single line for Vercel) |
| `GOOGLE_GENAI_API_KEY` | Secret | **REQUIRED** for Style Advisor — get from [Google AI Studio](https://ai.google.dev) |

### Optional Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `RESEND_API_KEY` | Secret | - | Resend email delivery API key |
| `STRIPE_SECRET_KEY` | Secret | - | Stripe card payments (secret) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | - | Stripe card payments (public) |
| `DARAJA_CONSUMER_KEY` | Secret | - | Safaricom Daraja M-Pesa consumer key |
| `DARAJA_CONSUMER_SECRET` | Secret | - | Safaricom Daraja M-Pesa consumer secret |
| `DARAJA_SHORTCODE` | Secret | - | Safaricom shortcode (e.g., 174379 for sandbox) |
| `DARAJA_PASSKEY` | Secret | - | Safaricom Daraja passkey |
| `DARAJA_ENV` | String | `sandbox` | `production` or `sandbox` |
| `NEXT_PUBLIC_APP_URL` | Public | - | Public deployment URL for callbacks (e.g., `https://mavazi-market.vercel.app`) |

### Setup Instructions

#### Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select a project
3. In **Project Settings** → **General**, copy your config
4. Create `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

5. In **Service Accounts**, generate a new private key and save as JSON
6. Convert to single-line string:

```bash
FIREBASE_ADMIN_SDK_CONFIG_JSON=$(jq -c . serviceAccountKey.json)
echo $FIREBASE_ADMIN_SDK_CONFIG_JSON
```

#### Google Genkit Configuration

1. Visit [Google AI Studio](https://ai.google.dev)
2. Click **Get API Key**
3. Create or select a project
4. Add to `.env.local`:

```bash
GOOGLE_GENAI_API_KEY=your-api-key-here
```

#### M-Pesa Integration (Optional)

1. Register at [Safaricom Daraja](https://developer.safaricom.co.ke/)
2. Create an app and get consumer credentials
3. Add to `.env.local`:

```bash
DARAJA_CONSUMER_KEY=your-key
DARAJA_CONSUMER_SECRET=your-secret
DARAJA_SHORTCODE=174379  # Sandbox shortcode
DARAJA_PASSKEY=your-passkey
DARAJA_ENV=sandbox
```

#### Vercel Deployment Configuration

In Vercel Dashboard → **Settings** → **Environment Variables**, add all `NEXT_PUBLIC_*` and secret variables. For `FIREBASE_ADMIN_SDK_CONFIG_JSON`:

```bash
# Paste the entire service account JSON as a single-line value:
{"type":"service_account","project_id":"...","private_key":"..."}
```

---

## 📁 Project Structure

```
mavazi-market/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Homepage (SSG + client components)
│   │   ├── layout.tsx                # Root layout with providers
│   │   ├── globals.css               # Global styles + theme variables
│   │   ├── [category]/page.tsx       # Dynamic category pages
│   │   ├── products/[productId]/     # Product detail pages
│   │   ├── cart/page.tsx             # Shopping cart page
│   │   ├── checkout/
│   │   │   ├── page.tsx              # Checkout form
│   │   │   └── actions.ts            # Payment processing (server actions)
│   │   ├── admin/                    # Admin dashboard
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── products/             # Product CRUD
│   │   │   ├── orders/               # Order management
│   │   │   ├── customers/            # Customer management
│   │   │   ├── categories/           # Category management
│   │   │   ├── analytics/            # Analytics dashboards
│   │   │   └── settings/             # Admin settings
│   │   ├── style-advisor/            # AI style advisor
│   │   │   ├── page.tsx
│   │   │   └── actions.ts            # Server action for AI call
│   │   ├── api/
│   │   │   └── payments/             # Webhook routes for payment callbacks
│   │   ├── auth/ (login, signup, forgot-password)
│   │   ├── profile/                  # User profile & order history
│   │   ├── order-confirmation/       # Order confirmation page
│   │   ├── about/, contact/, faq/    # Static pages
│   │   └── lib/placeholder-images.json
│   │
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── AdminHeader.tsx
│   │   │   └── AdminSidebar.tsx
│   │   ├── layout/                   # Layout components
│   │   │   ├── Header.tsx            # Navigation + cart icon
│   │   │   ├── Footer.tsx
│   │   │   └── ThemeApplicator.tsx
│   │   ├── products/                 # Product-related components
│   │   │   ├── ProductCard.tsx       # Reusable product card
│   │   │   ├── ImageCarousel.tsx     # Multi-image gallery
│   │   │   ├── FilterSidebar.tsx     # Filter & search
│   │   │   ├── QuickViewModal.tsx
│   │   │   └── ReviewStars.tsx
│   │   ├── cart/
│   │   │   └── CartDrawer.tsx        # Slide-out cart
│   │   ├── shared/                   # Shared components
│   │   │   └── Breadcrumbs.tsx
│   │   ├── home/
│   │   │   └── HomeClientWrapper.tsx # Client-side home logic
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx              # React Hook Form integration
│   │       └── ... (30+ components)
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Firebase auth + app user profile
│   │   └── CartContext.tsx           # Cart state + Firestore sync
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Responsive design hook
│   │   └── use-toast.ts              # Toast notifications
│   │
│   ├── lib/
│   │   ├── firebase.ts               # Firebase initialization
│   │   ├── firebase-admin.ts         # Admin SDK setup
│   │   ├── types.ts                  # TypeScript interfaces (Product, User, Order, etc.)
│   │   ├── utils.ts                  # Helper functions (formatKSh, cn, etc.)
│   │   ├── emailService.ts           # Resend email utilities
│   │   ├── mpesa.ts                  # M-Pesa Daraja integration
│   │   ├── storage.ts                # Firebase Storage utilities
│   │   └── mock-data.ts              # Sample products & categories
│   │   └── store/
│   │       └── useCartStore.ts       # Zustand cart store
│   │
│   └── ai/
│       ├── genkit.ts                 # Genkit setup (Gemini model)
│       ├── flows/
│       │   └── style-advisor.ts      # AI style advisor flow
│       └── dev.ts                    # Development server
│
├── scripts/
│   └── populateFirestore.ts          # Script to populate sample data
│
├── docs/
│   ├── blueprint.md                  # Original product blueprint
│   └── backend.json                  # API documentation
│
├── firestore.rules                   # Firestore security rules
├── firebase.rules                    # Firebase storage rules
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS theme extension
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── postcss.config.mjs                # PostCSS + Tailwind setup
└── components.json                   # shadcn/ui configuration
```

---

## 🎯 Core Features in Depth

### 1. Product Catalog & Discovery

**Files:**
- [src/app/page.tsx](src/app/page.tsx) — Homepage with featured products & categories
- [src/app/[category]/page.tsx](src/app/[category]/page.tsx) — Category browsing
- [src/app/products/[productId]/page.tsx](src/app/products/[productId]/page.tsx) — Product details
- [src/components/products/FilterSidebar.tsx](src/components/products/FilterSidebar.tsx) — Advanced filtering
- [src/components/products/ProductCard.tsx](src/components/products/ProductCard.tsx) — Product display card

**Features:**
- Server-side rendering for SEO (categories, products)
- Static generation with `generateStaticParams` for popular products
- Firestore queries with `where`, `limit`, `orderBy`
- Client-side filtering by price, size, color, material, brand
- Image optimization with Next.js `Image` component
- Reviews & rating system (stored in subcollections)

**Database Collections:**
```
/products/<productId>
  - name: string
  - description: string
  - price: number (in KSh)
  - images: string[] (Firebase Storage URLs)
  - category: string (ref to category ID)
  - subcategory: string
  - sizes: string[] (e.g., ["XS", "S", "M", "L", "XL"])
  - colors: string[] (e.g., ["Black", "Navy Blue", "Cream"])
  - material: string (e.g., "100% Cotton", "Silk Blend")
  - brand: string
  - stockQuantity: number
  - averageRating: number (1-5)
  - reviewCount: number
  - tags: string[] (for search)
  - isPublished: boolean
  - createdAt, updatedAt: Timestamp

/categories/<categoryId>
  - name: string
  - slug: string (URL-friendly)
  - image: string (cover image)
  - subcategories: Subcategory[]
    - id, name, slug, priceRange

/products/<productId>/reviews/<reviewId>
  - userId: string
  - rating: number (1-5)
  - title: string
  - comment: string
  - createdAt: Timestamp
```

### 2. Shopping Cart & Wishlist

**Files:**
- [src/contexts/CartContext.tsx](src/contexts/CartContext.tsx) — Cart state management
- [src/lib/store/useCartStore.ts](src/lib/store/useCartStore.ts) — Zustand cart store
- [src/components/cart/CartDrawer.tsx](src/components/cart/CartDrawer.tsx) — Cart UI
- [src/app/cart/page.tsx](src/app/cart/page.tsx) — Cart page

**Behavior:**
1. **Guest Users:** Cart stored in localStorage + Zustand
2. **Logged-In Users:** Cart synced to Firestore `users/{uid}/cartItems` subcollection
3. **Login Merge:** Guest cart items merged into Firestore on login
4. **Wishlist:** Guest wishlists stored in localStorage, merged to `users/{uid}.wishlist` array on login
5. **Real-Time Persistence:** Cart updates auto-save to cloud when user is authenticated

**Store Structure:**
```typescript
CartItem = {
  id: string;           // Unique ID
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;        // Product preview image
  size?: string;        // Selected size
  color?: string;       // Selected color
  slug?: string;
}
```

### 3. Checkout & Payment Processing

**Files:**
- [src/app/checkout/page.tsx](src/app/checkout/page.tsx) — Checkout form UI
- [src/app/checkout/actions.ts](src/app/checkout/actions.ts) — Server-side payment processing
- [src/lib/mpesa.ts](src/lib/mpesa.ts) — M-Pesa Daraja integration
- [src/app/api/payments/](src/app/api/payments/) — Webhook handlers

**Payment Flow:**

```
User submits checkout form
         ↓
Server action validates address & cart
         ↓
    Create order (status: Pending)
         ↓
Payment method selected:
├─→ M-Pesa: STK Push to phone → Daraja callback
├─→ Card (Stripe): Redirect to payment form
└─→ PayPal: Redirect to PayPal auth
         ↓
Payment webhook received
         ↓
Verify transaction in Firestore
         ↓
Update order status (Paid) + send confirmation email
         ↓
Redirect to order confirmation page
```

**Order Data Model:**
```typescript
Order = {
  id: string;                    // Firestore doc ID
  userId: string;                // Reference to user
  orderDate: Timestamp;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: CartItem[];
  totalAmount: number;           // Total in KSh
  shippingAddress: Address;
  paymentMethod: string;         // 'mpesa' | 'stripe' | 'paypal'
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentFailureReason?: string;
  trackingNumber?: string;
  mpesaTransactionId?: string;
  stripeSessionId?: string;
  updatedAt: Timestamp;
}
```

### 4. User Authentication & Profiles

**Files:**
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — Auth state management
- [src/app/login/page.tsx](src/app/login/page.tsx)
- [src/app/signup/page.tsx](src/app/signup/page.tsx)
- [src/app/profile/page.tsx](src/app/profile/page.tsx)

**Features:**
- Firebase Email/Password auth
- Password reset via email
- User profile creation on signup
- Persistent login (auth state in Context)
- Admin detection (email-based: `admin@mixostore.com`)
- Shipping address management

**User Data Model:**
```typescript
User = {
  id: string;                    // Firestore doc ID (same as uid)
  uid: string;                   // Firebase auth UID
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  shippingAddresses?: Address[]; // Multiple saved addresses
  wishlist?: string[];           // Array of product IDs
  role: 'user' | 'admin';
  disabled: boolean;
  createdAt, updatedAt: Timestamp;
}
```

### 5. AI-Powered Style Advisor

**Files:**
- [src/ai/genkit.ts](src/ai/genkit.ts) — Genkit + Gemini 2.0 Flash setup
- [src/ai/flows/style-advisor.ts](src/ai/flows/style-advisor.ts) — AI flow definition
- [src/app/style-advisor/page.tsx](src/app/style-advisor/page.tsx) — UI
- [src/app/style-advisor/actions.ts](src/app/style-advisor/actions.ts) — Server action

**Flow:**
1. User fills form (body type, skin tone, occasion, budget)
2. Server action calls `styleAdvisor()` flow
3. Genkit streams response from Gemini 2.0 Flash
4. Recommendations displayed in real-time
5. User can save recommendations or shop suggested products

**Example Input:**
```typescript
StyleAdvisorInput = {
  bodyType: "pear-shaped";
  skinTone: "deep";
  occasion: "casual-weekend";
  budget: 5000; // KSh
  preferences: ["sustainable", "local-brands"];
}
```

### 6. Admin Dashboard

**Files:**
- [src/app/admin/](src/app/admin/) — All admin pages
- [src/components/admin/AdminHeader.tsx](src/components/admin/AdminHeader.tsx)
- [src/components/admin/AdminSidebar.tsx](src/components/admin/AdminSidebar.tsx)

**Modules:**

| Module | Features |
|---|---|
| **Dashboard** | Revenue metrics, recent orders, top products, conversion funnels |
| **Products** | Create, list, edit, delete products; bulk upload; image management |
| **Categories** | Manage main categories and subcategories; set pricing ranges |
| **Orders** | View all orders, update status, track shipments, download invoices |
| **Customers** | Search users, view purchase history, manage accounts |
| **Analytics** | Charts (revenue, traffic), conversion tracking, customer segments |
| **Settings** | Store info, theme customization, email templates |

**Admin Access:**
- Determined by Firestore admin email check or `role: 'admin'` in user document
- Firestore rules enforce admin-only writes to products, categories, settings
- Admin routes should have client-side auth check + server-side verification

---

## 📊 Database Schema

### Collections Hierarchy

```
mavazi-market (Firestore)
│
├── products/
│   ├── {productId}/
│   │   ├── name, description, price, images[], sizes[], colors[]
│   │   ├── category, subcategory, material, brand
│   │   ├── stockQuantity, averageRating, reviewCount, isPublished
│   │   ├── createdAt, updatedAt
│   │   └── reviews/
│   │       └── {reviewId}/
│   │           ├── userId, rating, title, comment
│   │           └── createdAt
│   │
├── categories/
│   ├── {categoryId}/
│   │   ├── name, slug, image
│   │   ├── subcategories[] (embedded)
│   │   └── createdAt, updatedAt
│   │
├── users/
│   ├── {userId}/
│   │   ├── uid, name, email, phone, photoURL
│   │   ├── shippingAddresses[], wishlist[], role, disabled
│   │   ├── createdAt, updatedAt
│   │   └── cartItems/
│   │       └── {itemId}/
│   │           ├── productId, name, price, quantity, size, color, image
│   │           └── (syncs with Zustand on client)
│   │
├── orders/
│   ├── {orderId}/
│   │   ├── userId, orderDate, status
│   │   ├── items[], totalAmount, shippingAddress
│   │   ├── paymentMethod, paymentStatus, paymentFailureReason
│   │   ├── mpesaTransactionId, stripeSessionId, trackingNumber
│   │   └── updatedAt
│   │
└── settings/
    └── {settingId}/
        ├── siteTitle, siteLogo, theme, colors
        ├── emailTemplate, supportEmail
        └── maintenanceMode (boolean)
```

### Firestore Indexes (Auto-Created)

- `products`: `isPublished + createdAt` (for featured listings)
- `products`: `category + stockQuantity` (for catalog browsing)
- `orders`: `userId + orderDate` (for user order history)
- `users`: `email` (for auth lookups)

---

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Fetch products (cached via ISR) |
| GET | `/api/products/[id]` | Fetch product details |
| GET | `/api/categories` | Fetch all categories (cached) |

### Payment Webhooks

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/payments/mpesa/callback` | M-Pesa STK Push callback |
| POST | `/api/payments/stripe/webhook` | Stripe payment events |
| POST | `/api/payments/paypal/webhook` | PayPal IPN |

### Server Actions (Next.js)

**Mutation Endpoints** (called from client):

```typescript
// Checkout
POST /api/checkout (via server action)
Body: { cartItems, shippingAddress, paymentMethod, paymentToken }
Response: { success, orderId, redirectUrl }

// Style Advisor
POST /api/ai/style-advisor (via server action)
Body: { bodyType, skinTone, occasion, budget, preferences }
Response: { recommendations (stream) }

// User Profile
POST /api/user/profile (via server action)
Body: { name, phone, shippingAddresses }
Response: { success }
```

---

## 🚀 Deployment Guide

### Vercel Deployment (Recommended)

**Prerequisites:**
- Vercel account
- GitHub repository with this code
- All environment variables prepared

**Steps:**

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Select project root

2. **Configure Environment Variables**
   - In Vercel dashboard → **Settings** → **Environment Variables**
   - Add all `NEXT_PUBLIC_*` and secret variables
   - For multi-line JSON (Firebase Admin SDK):
     - Use the minified single-line JSON
     - Paste as-is into Vercel UI

3. **Deploy**
   - Vercel auto-deploys on `git push` to main branch
   - Or manually trigger: **Deployments** → **Redeploy**

4. **Post-Deployment**
   - Update `NEXT_PUBLIC_APP_URL` in Vercel to your deployment URL
   - Test M-Pesa callback by checking logs (Payments → Logs)
   - Monitor performance with **Analytics** tab

### Firebase Deployment

**Firestore:**
- Database auto-migrates with first write (no action needed)
- Deploy security rules: `firebase deploy --only firestore:rules`

**Storage Rules:**
- Deploy: `firebase deploy --only storage`

**Authentication:**
- Configure OAuth providers in Firebase Console (Google, Apple, etc.)

### SSL/HTTPS

- Vercel auto-provisions SSL certificates
- All communications encrypted by default

---

## ⚡ Performance Optimizations

### Image Optimization

- **Next.js Image Component** — Automatic WebP, lazy loading, responsive sizing
- **Responsive Srcset** — Serves appropriate size for device
- **Firebase CDN** — Images cached globally (Storage + Firestore reads)

### Code Splitting

- **Dynamic Imports** → Admin dashboard loaded on-demand
- **Route Splitting** → Each page route is a separate bundle
- **Tree Shaking** → Unused imports removed at build time

### Server-Side Rendering (SSR) & Static Generation (SSG)

- **Category Pages** → Generated at build time (revalidate every 24h with ISR)
- **Product Pages** → Generated on-demand with `generateStaticParams()`
- **Homepage** → SSG with dynamic featured products section

### Caching Strategy

```
Client (localStorage) ← Cart, wishlist
         ↓
Zustand (in-memory) ← Fast access
         ↓
Firestore (document cache) ← Real-time listener
         ↓
CDN (Vercel Edge Cache) ← Static pages
```

### Database Optimization

- **Firestore Reads** → Limited to necessary fields using projection
- **Query Optimization** → Indexed queries for common filters
- **Batch Operations** → Reduce RPC calls (writeBatch, updateDoc)
- **Real-Time Listeners** → Unsubscribe when components unmount

### Bundle Size

- **Tailwind CSS** — PurgeCSS removes unused styles (~50KB gzipped)
- **UI Library** — shadcn/ui uses tree-shaking (~30KB for used components)
- **AI Integration** — Genkit loaded only on Style Advisor page

**Current Bundle Size:** ~180KB gzipped (homepage) | ~250KB (with navigation)

---

## 🔐 Security & Best Practices

### Authentication & Authorization

1. **Firebase Security Rules** — All operations validated server-side
   - Users can only read/write their own data
   - Admins can manage products, categories, settings
   - Orders can only be created by authenticated users

2. **Environment Variables** — Secrets never exposed to client:
   - `FIREBASE_ADMIN_SDK_CONFIG_JSON` — Server-only
   - `GOOGLE_GENAI_API_KEY` — Server-only (via server action)
   - `DARAJA_CONSUMER_SECRET` — Server-only

3. **API Rate Limiting** — Implement in Vercel or Cloud Functions:
   - Payment endpoints: 10 req/min per IP
   - Auth endpoints: 5 req/min per IP

### Data Protection

- **HTTPS Everywhere** — SSL/TLS for all communication
- **Payment Data** — Never stored locally; delegated to Stripe/M-Pesa
- **Firestore Encryption** — At-rest encryption by default
- **Firebase Storage** — Auth-gated access to media files

### Content Security

- **No SQL Injection** — Firestore queries use parameterized queries
- **XSS Prevention** — React auto-escapes JSX content
- **CSRF Protection** — Next.js checks origin headers for server actions

### Audit & Monitoring

- **Firestore Logs** — Track all reads/writes in Firebase Console
- **Vercel Analytics** — Monitor performance, errors, conversions
- **Error Tracking** — Sentry integration (optional) for client errors

---

## 💻 Development Workflow

### Code Standards

**TypeScript:**
- Strict mode enabled (`tsconfig.json`)
- Type all function parameters and returns
- Use `type` for type definitions, `interface` for objects

**Styling:**
- Tailwind CSS utilities (no inline `style` prop)
- Theme colors from CSS variables
- Mobile-first breakpoints: `sm`, `md`, `lg`, `xl`

**Component Structure:**
```tsx
'use client'; // if interactive

import { type ReactNode } from 'react'; // React imports first
import { useContext } from 'react'; // hooks after
import { Button } from '@/components/ui/button'; // local imports last

interface Props {
  title: string;
  children?: ReactNode;
  className?: string;
}

export function MyComponent({ title, children, className }: Props) {
  // Implementation
  return <div className={cn('base-class', className)}>{children}</div>;
}
```

**Naming Conventions:**
- Components: PascalCase (`ProductCard.tsx`)
- Utilities: camelCase (`formatKSh()`)
- Constants: UPPER_SNAKE_CASE (`GUEST_WISHLIST_LOCAL_STORAGE_KEY`)
- Firestore paths: snake_case (`user_preferences`)

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/add-paypal-button

# Make changes
git add .
git commit -m "feat: add PayPal button to checkout"

# Push and create pull request
git push origin feature/add-paypal-button

# After review, merge to main
# Vercel auto-deploys
```

### Testing (Optional but Recommended)

- **Unit Tests** — Jest for utilities, hooks
- **E2E Tests** — Playwright for checkout flow
- **Manual Testing** — Staging environment mirrors production

---

## 🐛 Troubleshooting

### Common Issues

#### Firebase Initialization Fails

**Error:** `Firebase API key is missing. Skipping Firebase initialization during build.`

**Solution:**
- Ensure `.env.local` has all `NEXT_PUBLIC_FIREBASE_*` variables
- Check variable names match exactly (case-sensitive)
- Restart dev server after adding `.env.local`

#### M-Pesa Callback Not Received

**Symptoms:** Orders stuck in "Pending" status

**Debug Steps:**
```bash
# 1. Check Daraja credentials in .env.local
echo $DARAJA_CONSUMER_KEY

# 2. Verify callback URL is accessible
curl https://your-domain.com/api/payments/mpesa/callback

# 3. Check Firestore for webhook logs (if implemented)
# Database → payments → callbacks → logs

# 4. Contact Safaricom support with shortcode + test transaction
```

#### Slow Image Loading

**Symptoms:** Product images load slowly

**Solutions:**
- Enable Firebase CDN caching
- Compress images before uploading (WebP, <2MB)
- Check Firebase Storage rules allow public read
- Use `Image` component with `priority` for above-fold images

#### Cart Not Persisting

**Symptoms:** Cart empty after page refresh

**Debug Steps:**
```bash
# 1. Check localStorage
# Open DevTools → Application → Local Storage → check CART_ITEMS key

# 2. For logged-in users, check Firestore
# Firestore → users → {uid} → cartItems

# 3. Clear cache and retry
localStorage.clear()

# 4. Check Zustand store initialization
# src/lib/store/useCartStore.ts — verify hydration logic
```

#### Admin Dashboard Not Accessible

**Error:** "Unauthorized" or redirect to homepage

**Solution:**
- Verify user email is `admin@mixostore.com`
- Or manually set `role: 'admin'` in Firestore user document
- Check Firestore Rules for admin role verification
- Clear auth cache: `firebase.auth().signOut()` then login again

#### Genkit AI Fails / Empty Recommendations

**Symptoms:** Style Advisor returns errors or blank responses

**Steps:**
```bash
# 1. Verify API key is set correctly
echo $GOOGLE_GENAI_API_KEY

# 2. Check usage quota in Google AI Studio
# https://ai.google.dev/

# 3. Test API directly
curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent \
  -H "Content-Type: application/json" \
  -H "x-goog-api-key: YOUR_API_KEY" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# 4. Check Vercel logs for detailed error
vercel logs --tail
```

### Performance Debugging

```bash
# Build analysis
npm run build

# Check bundle size
npm install -g @vercel/analyse
npm run build && ANALYZE=1 npm run build

# Monitor real-time metrics
vercel telemetry enable
```

---

## 🎓 Learning Resources

- **Next.js Docs** — https://nextjs.org/docs
- **Firebase Docs** — https://firebase.google.com/docs
- **Tailwind CSS** — https://tailwindcss.com/docs
- **Genkit** — https://firebase.google.com/docs/genkit
- **Daraja API** — https://developer.safaricom.co.ke/docs
- **shadcn/ui Components** — https://ui.shadcn.com

---

## 📝 License

This project is proprietary software. All rights reserved.

---

## 👥 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📞 Support & Contact

- **Email:** support@mavazimarket.com
- **Live Chat:** [Coming Soon]
- **GitHub Issues:** [Report bugs here](https://github.com/your-org/mavazi-market/issues)

---

**Last Updated:** March 2026  
**Maintained by:** Mavazi Market Team  
*Handcrafted in Nairobi, Kenya. Heritage Inspired, Modern Crafted.*
