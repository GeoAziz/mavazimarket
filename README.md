
# Mavazi Market - Modern E-commerce Platform

Mavazi Market is a high-fidelity, full-stack e-commerce platform built for the bold soul. Fulfilling the March 2026 Blueprint, it combines Afrocentric heritage with modern performance infrastructure.

## 🚀 Deployment & Infrastructure

This application is optimized for **Vercel** and **Firebase**.

### 1. Vercel Environment Variables

To activate the professional tech stack (Analytics, Email, Payments), configure the following in your Vercel Dashboard:

| Key | Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase project's API Key. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | **CRITICAL:** Ensure this is exactly your ID (e.g., `mavazi-market`). |
| `FIREBASE_ADMIN_SDK_CONFIG_JSON` | The entire service account JSON (as a single line). Used for Customer Management. |
| `GOOGLE_GENAI_API_KEY` | **REQUIRED:** Your Google AI Studio key for the Style Advisor. |
| `RESEND_API_KEY` | For production-grade transactional emails. |
| `NEXT_PUBLIC_APP_URL` | The full URL of your deployment (e.g., `https://mavazi-market.vercel.app`). |

### 2. Firestore Security Rules

Ensure you have deployed the rules provided in `firestore.rules`. These rules protect customer data and enforce Admin-only management of the heritage collection.

### 3. Performance Features

- **SSG (Static Site Generation)**: Top-level categories and product pages are pre-rendered for instant loading.
- **Image Optimization**: Automatic WebP conversion and lazy-loading via `next/image`.
- **Vercel Analytics**: Real-time performance and conversion tracking integrated.

## 🛠️ High-End Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Terracotta & Gold System)
- **Database**: Firestore (Real-time NoSQL)
- **Auth**: Firebase Authentication (With Admin SDK escalated actions)
- **Media**: Firebase Storage (Secure Cloud Archive)
- **State**: Zustand (Persistent Bag Management)
- **AI**: Genkit (Heritage Style Advisor)

## 💻 Local Development

1. `npm install`
2. `npm run dev`
3. Populate database: `npm run populate-db` (Requires service account JSON)

---
*Handcrafted in Nairobi, Kenya. Heritage Inspired, Modern Crafted.*
