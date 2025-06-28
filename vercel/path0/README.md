# Mavazi Market - Modern E-commerce Platform

Mavazi Market is a feature-rich, full-stack e-commerce web application built with a modern tech stack. It's designed as a stylish and functional online fashion marketplace tailored for the Kenyan market, demonstrating a complete end-to-end user and admin experience.

![Mavazi Market Admin Dashboard](https://raw.githubusercontent.com/Mavazi-Market/mavazi-market-images/main/admin-dashboard.png)

## 🛠️ Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with ShadCN UI for component primitives.
- **Database:** Firestore (NoSQL)
- **Authentication:** Firebase Authentication
- **AI/Generative:** Google AI & Genkit
- **Form Management:** React Hook Form with Zod for schema validation.
- **Server-side Logic:** Next.js Server Actions
- **Email:** Nodemailer

## 🚀 Deployment on Vercel

This application is configured for easy deployment on [Vercel](https://vercel.com/).

### Vercel Environment Variables

For the build and deployment to succeed, you **MUST** configure the following environment variables in your Vercel project settings. The build will succeed without them, but the live application will not be able to connect to Firebase or send emails.

1.  **Client-Side Firebase Keys:** These are required for the frontend application to connect to your Firebase project.
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`

2.  **Server-Side Admin Key:** This is required for server actions (like creating a user profile in Firestore after signup) to work.
    *   `FIREBASE_ADMIN_SDK_CONFIG_JSON`: The value for this variable must be the **entire JSON content** of your Firebase service account key, formatted as a single-line string. **Crucially, all newline characters (`\n`) within the `private_key` value must be escaped as `\\n`.**

3.  **Email Service Keys:** These are required for sending transactional emails (welcome, order confirmation).
    *   `GMAIL_EMAIL`: The Gmail address you are sending from.
    *   `GMAIL_APP_PASSWORD`: The 16-character Google App Password for your account.
    *   `NEXT_PUBLIC_APP_URL`: The full URL of your deployed application (e.g., `https://your-project-name.vercel.app`). This is used to create correct links in emails.

## 💻 Local Development

### Prerequisites
- Node.js (v18 or later)
- npm, yarn, or pnpm
- A Firebase project with Authentication and Firestore enabled.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/mavazi-market.git
    cd mavazi-market
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    - Create a `.env.local` file in the project root.
    - Populate it with all the same keys listed above in the "Vercel Environment Variables" section. Refer to `.env.example` for the required keys.
    
4.  **Populate the Database:**
    - Place your Firebase Admin SDK service account key file in the project root. The script expects it to be named `mavazi-market-firebase-adminsdk-fbsvc-c781dbd1ae.json`.
    - Run the population script to seed your Firestore database with mock categories, products, and users (including an admin user).
    ```bash
    npm run populate-db
    ```
    - The script will create an admin user with the email `admin@mixostore.com` and password `Mixo123!`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## ✅ Next Steps & Future Enhancements

The core application is complete. Future work would focus on integrating production-ready external services.

-   [ ] **Payment Gateway Integration:** Implement a real payment provider like Stripe or a local Kenyan alternative (e.g., M-Pesa API via DARAJA).
-   [ ] **Cloud Storage for Images:** Connect the product and category image upload forms to Firebase Storage or another cloud provider.
-   [ ] **Implement Real Admin Actions:** Replace mocked admin actions (e.g., changing user roles, bulk updates) with secure Firebase Cloud Functions.
-   [ ] **Server-Side Search:** Implement a robust search feature that queries the database directly instead of filtering on the client.
-   [ ] **Add End-to-End Testing:** Implement a testing framework like Cypress or Playwright to ensure application reliability.
-   [ ] **Deployment:** Prepare and document the process for deploying to a platform like Vercel or Firebase Hosting.
