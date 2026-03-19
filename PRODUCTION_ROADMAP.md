# 🚀 Production Readiness Roadmap

**Status:** 🔴 NOT PRODUCTION READY  
**Timeline:** 2-3 weeks (Tier-1 blocking)  
**Last Updated:** March 19, 2026

---

## Overview

This document tracks all critical tasks required to move Mavazi Market to production. Each task is mapped to specific codebase files, includes impact analysis, and provides clear acceptance criteria.

**Task Breakdown:**
- **Tier 1:** 7 blocking issues (MUST fix before any production deploy)
- **Tier 2:** 5 high-priority items (MUST complete before launch)
- **Tier 3:** 4 medium-priority items (complete in week 2-3)
- **Tier 4:** 4 post-launch nice-to-haves

---

## 🔴 TIER 1: BLOCKING ISSUES (Non-Negotiable)

### 1.1 Re-enable TypeScript/ESLint Build Failures

**Current Risk:** 🔴 CRITICAL  
**Impact:** Hidden runtime bugs shipped to production; deploy failures go undetected

**Files Affected:**
- [next.config.ts](next.config.ts) — Lines 27-31
- [package.json](package.json) — Build script

**Current State:**
```typescript
// next.config.ts (WRONG FOR PRODUCTION)
typescript: {
  ignoreBuildErrors: true,  // ❌ Hide type errors
},
eslint: {
  ignoreDuringBuilds: true, // ❌ Hide lint errors
},
```

**Changes Required:**
1. Remove both `ignore*` settings from `next.config.ts`
2. Run `npm run build` and `npm run typecheck` locally
3. Fix ALL TypeScript errors until build is clean
4. Fix ALL ESLint violations
5. Add both checks to CI/CD pipeline (Tier 2.1)

**Acceptance Criteria:**
- ✅ `npm run build` runs clean with no type errors
- ✅ `npm run typecheck` reports 0 errors
- ✅ `npm run lint` reports 0 errors
- ✅ CI pipeline blocks merge if any check fails

**Estimated Effort:** 2-3 days (depends on error count)

---

### 1.2 Enable Firebase App Check

**Current Risk:** 🔴 CRITICAL  
**Impact:** Unprotected Firebase APIs; bots/attackers can abuse Firestore reads, payment endpoints, authentication

**Files Affected:**
- [src/lib/firebase.ts](src/lib/firebase.ts) — Initialization
- [src/app/layout.tsx](src/app/layout.tsx) — Root provider setup
- [next.config.ts](next.config.ts) — Environment variables
- [firestore.rules](firestore.rules) — Rules updates (optional but recommended)

**Current State:**
```typescript
// src/lib/firebase.ts
// NO App Check initialization present
```

**Changes Required:**
1. Initialize App Check in `src/lib/firebase.ts`:
   - Add `initializeAppCheck(app, { provider: new ReCaptchaV3Provider(RECAPTCHA_KEY) })`
   - Get reCAPTCHA key from Firebase Console → Product Settings → App Check
2. Add `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` to environment
3. Add App Check token enforcement in server actions (payment/auth/admin)
4. Update Firestore rules to accept App Check tokens
5. Configure enforcement in Firebase Console (Start enforcing after 7 days testing)

**Enforcement Points:**
- Payment webhooks should verify App Check before processing
- Admin mutations should verify App Check
- User profile writes should verify App Check

**Acceptance Criteria:**
- ✅ App Check initialized in production
- ✅ ReCAPTCHA working on checkout + admin pages
- ✅ Firestore Console shows App Check tokens being verified
- ✅ Unapproved apps blocked from accessing Firestore

**Estimated Effort:** 1-2 days

---

### 1.3 Lock Down Firestore Security Rules

**Current Risk:** 🔴 CRITICAL  
**Impact:** Clients can write invalid data; potential data corruption; price/inventory manipulation

**Files Affected:**
- [firestore.rules](firestore.rules) — Main security rules
- [firebase.rules](firebase.rules) — Storage rules (separate, needs cleanup)

**Current State (Firestore Rules Gaps):**

| Data Type | Current Risk | Example Attack |
|---|---|---|
| **Product** | No type validation | Client writes `price: "abc"` or `price: -999` |
| **Order** | Clients can write `totalAmount` | Client writes 0 instead of computed total |
| **Order Status** | No transition machine | Client sets status directly to "Delivered" |
| **Review** | No rate limiting | User posts 1000 reviews per second |
| **User** | Clients can write `role: "admin"` | First-time user self-promotes |
| **Server Fields** | Writable by clients | `createdAt`, `updatedAt`, `averageRating` modified |

**Changes Required:**

**3a. Schema Validation Rules:**
1. Add field-level validation for each collection:
   ```
   // Products: type checks, range validation
   - price: must be number >= 0
   - stock: must be integer >= 0
   - rating: must be 1-5 or null
   - images: must be array of URLs
   - sizes, colors: must be arrays of strings
   
   // Orders: computed fields locked
   - totalAmount: must equal sum of item prices (server computes)
   - status: only in { Pending, Processing, Shipped, Delivered, Cancelled }
   - userId: must match request.auth.uid
   
   // Users: role field locked
   - role: can only be written by admins
   - disabled: can only be written by admins
   ```

2. Prevent server-owned field writes:
   ```
   Locked fields (only server can set):
   - createdAt
   - updatedAt
   - averageRating
   - reviewCount
   - reviewStatus
   ```

3. Add review rate limiting rules:
   ```
   - Max 10 reviews per user per day
   - One review per product per user
   - Review timestamp must be now (not backdated)
   ```

**3b. Order Integrity Rules:**
1. Implement status state machine:
   ```
   Pending → Processing OR Cancelled
   Processing → Shipped OR Cancelled
   Shipped → Delivered
   (no reverse transitions)
   ```

2. Lock critical order fields:
   ```
   Create: userId, items[], shippingAddress
   Client can ONLY set: status (within allowed transitions)
   Admin-only fields: trackingNumber, paymentStatus
   ```

**3c. Address both rules files:**
- [firestore.rules](firestore.rules) — Main file, keep this
- [firebase.rules](firebase.rules) — Storage rules, overlapping logic
- **Action:** Merge storage logic into firestore.rules OR consolidate and delete one

**Acceptance Criteria:**
- ✅ All field types validated (reject invalid types)
- ✅ Range validation working (price >= 0, rating 1-5)
- ✅ Status transitions enforced (no direct "Delivered" writes)
- ✅ Server fields locked (createdAt/updatedAt/avgRating immutable)
- ✅ Review rate limiting active
- ✅ Single unified rules file deployed
- ✅ Firestore Console shows rule matches working

**Estimated Effort:** 3-4 days

---

### 1.4 Fix Admin Authorization (Single Source of Truth)

**Current Risk:** 🟠 HIGH  
**Impact:** Admin role can drift between custom claims and Firestore; inconsistent behavior; potential privilege escalation

**Files Affected:**
- [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) — Lines 52-55 (admin check)
- [scripts/populateFirestore.ts](scripts/populateFirestore.ts) — Lines ??? (seed sets both)
- [src/app/admin/customers/[customerId]/actions.ts](src/app/admin/customers/[customerId]/actions.ts) — Role update logic
- [firestore.rules](firestore.rules) — Lines 9-11 (admin check logic)

**Current State (Dual Authority Problem):**
```typescript
// Custom Claims (in-token)
setCustomUserClaims(userId, { admin: true, role: 'admin' })

// Firestore Role Field
users/{userId}.role = 'admin'

// Firestore Rules check BOTH
function isAdmin() {
  return get(/databases/.../users/$(request.auth.uid)).data.role == 'admin' ||
         request.auth.token.admin == true;
}
```

**Problem:** If either gets out of sync, behavior is unpredictable.

**Recommended Fix (Custom Claims as Source of Truth):**

1. **Custom Claims = Admin Source of Truth**
   - All admin checks use `request.auth.token.admin == true`
   - Add custom claim when role is changed (server action runs with Admin SDK)
   - Remove custom claim when role is revoked

2. **Firestore Role Field = Display/Profile Only**
   - Keep for UI display ("Show user is admin in profile")
   - NOT used for privilege logic
   - Can be written to by client (non-critical field)

3. **Firestore Rules Refactor:**
   ```
   // Old: checks both sources
   function isAdmin() {
     return get(...).data.role == 'admin' OR 
            request.auth.token.admin == true;
   }
   
   // New: checks token only (single source)
   function isAdmin() {
     return request.auth.token.admin == true;
   }
   ```

4. **Role Change Flow:**
   - Admin updates user role via action
   - Server action uses Admin SDK to set custom claim
   - Server action updates Firestore profile role (for display)
   - Both in same transaction to prevent drift

5. **Add validation:**
   - Only Admin SDK can set custom claims (enforce server-side)
   - Users cannot self-promote via Firestore writes

**Changes Required in Each File:**

| File | Change | Details |
|---|---|---|
| [firestore.rules](firestore.rules) | Update `isAdmin()` function | Check token only, not Firestore role |
| [src/app/admin/customers/[customerId]/actions.ts](src/app/admin/customers/[customerId]/actions.ts) | Add `setCustomUserClaims()` call | Set claim when role changes |
| [scripts/populateFirestore.ts](scripts/populateFirestore.ts) | Use Admin SDK for seed | Ensure sync between token + Firestore |
| [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx) | Update admin detection | `current.user.isAdmin = user.customClaims?.admin ?? false` |

**Acceptance Criteria:**
- ✅ Custom claims are source of truth for admin checks
- ✅ Firestore rules only check `request.auth.token.admin`
- ✅ Role changes set custom claim + Firestore field atomically
- ✅ Firestore schema validation prevents users from writing `role: 'admin'`
- ✅ All admin checks work consistently across app

**Estimated Effort:** 1-2 days

---

### 1.5 Payment Idempotency (Prevent Duplicate Charges)

**Current Risk:** 🔴 CRITICAL  
**Impact:** User clicks "Pay" twice → charged twice; webhook retries → multiple orders created

**Files Affected:**
- [src/app/checkout/actions.ts](src/app/checkout/actions.ts) — Payment processing
- [src/lib/mpesa.ts](src/lib/mpesa.ts) — M-Pesa integration
- [src/app/api/payments/mpesa/callback](src/app/api/payments/mpesa/callback) — Webhook handler
- [src/lib/types.ts](src/lib/types.ts) — Order schema

**Current State (No Idempotency):**
```typescript
// src/app/checkout/actions.ts
export async function processCheckout(data) {
  // Creates order
  // Initiates payment
  // If user clicks "Pay" again → creates ANOTHER order
  // If webhook fires twice → creates TWO order documents
}
```

**Changes Required:**

1. **Add Idempotency Key to Checkout:**
   - Generate UUID on checkout form mount (client-side)
   - Pass with every payment request
   - Server stores idempotency mapping: `idempotencyKey → orderId`

2. **Implement Deduplication Logic:**
   ```typescript
   // processCheckout logic
   - Check: does idempotencyKey exist in cache/Firestore?
   - If yes: return existing orderId (don't create new order)
   - If no: create order + payment intent + store mapping
   ```

3. **Idempotency Storage (Firestore):**
   ```
   /idempotencyKeys/{key}
   - orderId: string
   - createdAt: Timestamp
   - expiresAt: Timestamp (TTL: 24 hours)
   ```

4. **Webhook Idempotency:**
   - External payment webhooks (Stripe, M-Pesa) may fire multiple times
   - Add `externalTransactionId` to idempotency check
   - Query: `orders where mpesaTransactionId == X` → if exists, skip

5. **Order Schema Updates:**
   ```typescript
   Order {
     id: string;
     idempotencyKey: string; // ← NEW
     mpesaTransactionId: string; // Daraja transaction ID (unique)
     stripeSessionId: string; // Stripe session ID (unique)
     createdAt: Timestamp;
   }
   ```

**Implementation Points:**

| Component | Change |
|---|---|
| [src/app/checkout/page.tsx](src/app/checkout/page.tsx) | Generate idempotencyKey on mount; pass to action |
| [src/app/checkout/actions.ts](src/app/checkout/actions.ts) | Add dedup check before order creation |
| [src/app/api/payments/mpesa/callback](src/app/api/payments/mpesa/callback) | Check mpesaTransactionId before updating order |
| [firestore.rules](firestore.rules) | Index on `mpesaTransactionId` + `stripeSessionId` for quick lookups |

**Acceptance Criteria:**
- ✅ Double-click "Pay" → only one order created
- ✅ Webhook fires twice → order updated once
- ✅ Idempotency key persists across page refreshes (not cleared)
- ✅ Idempotency keys auto-expire after 24 hours
- ✅ Firestore shows no duplicate orders with same transaction ID

**Estimated Effort:** 2-3 days

---

### 1.6 Server-Side Order Total Calculation

**Current Risk:** 🔴 CRITICAL  
**Impact:** Client can send `totalAmount: 1` → charged 1 KSh instead of actual amount

**Files Affected:**
- [src/app/checkout/actions.ts](src/app/checkout/actions.ts) — Payment processing
- [src/app/checkout/page.tsx](src/app/checkout/page.tsx) — Sends totals to server
- [src/lib/types.ts](src/lib/types.ts) — Order schema
- [firestore.rules](firestore.rules) — Lock totalAmount field

**Current State (Naive Implementation):**
```typescript
// src/app/checkout/actions.ts (WRONG)
export async function processCheckout(data) {
  // Receives totalAmount from client
  const { cartItems, totalAmount, shippingAddress } = data;
  
  // Creates order with client-provided total
  const order = {
    items: cartItems,
    totalAmount: totalAmount,  // ❌ TRUSTS CLIENT
    status: 'Pending',
  };
  
  // Charges user for whatever totalAmount they sent
  const paymentResult = await chargeUser(totalAmount);
}
```

**Attack Vector:**
```typescript
// Client submits:
{
  cartItems: [{id: '1', price: 5000, qty: 2}],
  totalAmount: 1,  // ❌ Should be 10000, sends 1 instead
  shippingAddress: {...}
}
```

**Changes Required:**

1. **Remove totalAmount from Client Submission:**
   - Client sends: `cartItems[], shippingAddress`
   - Server computes total from scratch

2. **Implement Server-Side Total Calculation:**
   ```typescript
   // server action
   export async function processCheckout(cartItemIds, shippingAddress) {
     // 1. Fetch current prices from Firestore
     const products = await Promise.all(
       cartItemIds.map(id => getProductPrice(id))
     );
     
     // 2. Compute subtotal from DB prices (not client prices)
     let subtotal = 0;
     cartItemIds.forEach(item => {
       const product = products[item.productId];
       subtotal += product.price * item.quantity;
     });
     
     // 3. Apply discount rules (if any)
     const discount = await calculateDiscount(cartItemIds);
     
     // 4. Add shipping cost (based on zone)
     const shippingCost = await calculateShipping(shippingAddress);
     
     // 5. Add tax rules
     const tax = await calculateTax(subtotal + shipping);
     
     // 6. Compute final amount
     const totalAmount = subtotal - discount + shippingCost + tax;
     
     // 7. Create order + charge
     const order = await createOrder({
       items: cartItemIds,
       totalAmount,  // ✅ SERVER-COMPUTED
       shippingAddress,
     });
     
     return await processPayment(totalAmount);
   }
   ```

3. **Validation Rules:**
   - Firestore rules: `block writes to orders { totalAmount }`
   - Only server actions can set totalAmount
   - Immutable after order creation

4. **Discount/Shipping/Tax Engines:**
   - Centralize in utility functions or Firestore documents
   - Server applies before computing total
   - Never trust client-provided discounts

**Changes Required in Each File:**

| File | Change |
|---|---|
| [src/app/checkout/actions.ts](src/app/checkout/actions.ts) | Fetch product prices; compute total server-side |
| [src/app/checkout/page.tsx](src/app/checkout/page.tsx) | Only send item IDs + address; remove totalAmount |
| [src/lib/types.ts](src/lib/types.ts) | Add discount/shipping/tax to Order schema |
| [firestore.rules](firestore.rules) | Add validation: `OrderTotalAmount == calculateTotal(items)` |

**Acceptance Criteria:**
- ✅ Client cannot send totalAmount (validation rejects)
- ✅ Server always fetches current prices from DB
- ✅ Discount/shipping/tax applied server-side
- ✅ Final amount matches actual charge (within calculated bounds)
- ✅ If product price changes mid-checkout, totals recalculated

**Estimated Effort:** 2-3 days

---

### 1.7 Inventory Transactions (Prevent Oversell)

**Current Risk:** 🔴 CRITICAL  
**Impact:** Stock can go negative; customers charge for out-of-stock items; inventory data corruption

**Files Affected:**
- [src/app/checkout/actions.ts](src/app/checkout/actions.ts) — Checkout flow
- [src/lib/types.ts](src/lib/types.ts) — Product + Order schema
- [firestore.rules](firestore.rules) — Stock validation rules
- [src/app/products/[productId]/page.tsx](src/app/products/[productId]/page.tsx) — "Add to cart" button

**Current State (Race Condition Vulnerability):**
```
Product: stockQuantity = 1 (1 shirt left)

User A (Time 0ms):  reads stockQuantity = 1 ✓ can buy
User B (Time 0ms):  reads stockQuantity = 1 ✓ can buy (SAME TIME)

User A (Time 100ms): charges 1 shirt, stockQuantity -= 1 → now 0
User B (Time 101ms): charges 1 shirt, stockQuantity -= 1 → now -1 ❌

Result: Overbilled, oversold, inventory corrupt
```

**Changes Required:**

1. **Implement Firestore Transactions:**
   ```typescript
   // src/app/checkout/actions.ts
   const transaction = db.transaction();
   
   const success = await transaction.runTransaction((trx) => {
     // 1. Read stock (inside transaction)
     const productRef = doc(db, 'products', productId);
     const productDoc = await trx.get(productRef);
     const current_stock = productDoc.data().stockQuantity;
     
     // 2. Validate sufficient stock
     if (current_stock < requestedQuantity) {
       throw new Error('Not enough stock');
     }
     
     // 3. Atomically decrement
     trx.update(productRef, {
       stockQuantity: current_stock - requestedQuantity,
     });
     
     // 4. Create order reference
     const orderRef = doc(collection(db, 'orders'));
     trx.set(orderRef, { ... });
     
     return orderRef;
   });
   ```

2. **Reserve vs Decrement Decision:**
   **Option A (Pessimistic - Reserve on Checkout):**
   - Add `reservedQuantity` field to products
   - On checkout start: `reservedQuantity += 1`
   - On payment success: `stockQuantity -= 1`, `reservedQuantity -= 1`
   - On payment failure: `reservedQuantity -= 1` (release reservation)
   - **Pros:** Can show "2 people shopping this" to slow down hoarding
   - **Cons:** More complex; need cleanup job for abandoned checkouts

   **Option B (Optimistic - Decrement on Success):**
   - On payment success: atomically decrement `stockQuantity`
   - If payment fails: manually increment back
   - **Pros:** Simpler; no abandoned reservation cleanup needed
   - **Cons:** Slight window where stock shows available but isn't

   **Recommendation:** Option B (simpler, Kenyan e-commerce norm)

3. **Product Schema Updates:**
   ```typescript
   Product {
     stockQuantity: number;
     reservedQuantity?: number; // If using Option A
     lowStockThreshold: number; // Trigger reorder alert
     lastRestocked: Timestamp;
   }
   ```

4. **Error Handling:**
   - If stock insufficient: return 400 error ("Out of stock")
   - If transaction aborts: retry up to 3x with exponential backoff
   - After 3 retries: show user "please try again later"

5. **Admin Inventory Management:**
   - Add manual stock adjustment endpoint (admin only)
   - Track stock changes in audit log
   - Alert on stockQuantity <= lowStockThreshold

**Implementation Points:**

| Component | Change |
|---|---|
| [src/app/checkout/actions.ts](src/app/checkout/actions.ts) | Wrap checkout in Firestore transaction |
| [src/app/products/[productId]/page.tsx](src/app/products/[productId]/page.tsx) | Show "In Stock"/"Out of Stock" dynamically |
| [src/app/admin/products/[productId]/page.tsx](src/app/admin/products/[productId]/page.tsx) | Add manual stock adjustment UI |
| [firestore.rules](firestore.rules) | Add validation: `stockQuantity >= 0` (no negative stock) |

**Acceptance Criteria:**
- ✅ Simultaneous checkouts fail gracefully (one succeeds, other gets "out of stock")
- ✅ No negative stock possible
- ✅ Stock updates are atomic (no lost updates)
- ✅ If payment fails, manual increment restores stock
- ✅ Admin can override stock (for corrections/returns)
- ✅ Low stock alerts trigger at threshold

**Estimated Effort:** 2-3 days

---

## 🟠 TIER 2: HIGH PRIORITY (Before Launch Week)

### 2.1 Add CI/CD Pipeline

**Current Risk:** 🟠 HIGH  
**Impact:** Broken code merged to main; no automated quality gates

**Files Affected:**
- `.github/workflows/` — Create new CI workflows
- [next.config.ts](next.config.ts) — Re-enable build checks (from Tier 1.1)
- [package.json](package.json) — Ensure scripts exist

**Required Setup:**

1. **GitHub Actions Workflow:** `.github/workflows/ci.yml`
   ```yaml
   - Lint check (ESLint)
   - Type check (TypeScript)
   - Build test (next build)
   - Minimal test suite (if added in 2.2)
   - Block merge if any fails
   ```

2. **Staging Deployment:** `.github/workflows/deploy-staging.yml`
   - Deploy to staging after merge to develop branch
   - Run smoke tests

3. **Production Deployment:** `.github/workflows/deploy-prod.yml`
   - Manual approval required
   - Deploy to production after PR approval

**Acceptance Criteria:**
- ✅ PR cannot be merged if CI fails
- ✅ All checks run in <5 minutes
- ✅ Staging environment auto-deploys after develop merge
- ✅ Production requires manual approval

**Estimated Effort:** 1 day

---

### 2.2 Implement Order Status State Machine

**Current Risk:** 🟠 HIGH  
**Impact:** Invalid order states possible; business logic violated

**Files Affected:**
- [src/lib/types.ts](src/lib/types.ts) — Order status enum
- [src/app/admin/orders/[orderId]/actions.ts](src/app/admin/orders/[orderId]/actions.ts) — Status update logic
- [firestore.rules](firestore.rules) — Enforce valid transitions

**Current State:**
```typescript
// src/lib/types.ts
status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
// No validation of transitions; can jump from Pending → Delivered
```

**Changes Required:**

1. **Define State Machine:**
   ```
   Pending → {Processing, Cancelled}
   Processing → {Shipped, Cancelled}
   Shipped → {Delivered}
   Delivered → {} (terminal)
   Cancelled → {} (terminal)
   ```

2. **Implement Transition Logic:**
   ```typescript
   // src/app/admin/orders/[orderId]/actions.ts
   export async function updateOrderStatus(orderId, newStatus) {
     const order = await getOrder(orderId);
     const currentStatus = order.status;
     
     // Validate transition
     const allowedTransitions = {
       'Pending': ['Processing', 'Cancelled'],
       'Processing': ['Shipped', 'Cancelled'],
       'Shipped': ['Delivered'],
       'Delivered': [],
       'Cancelled': [],
     };
     
     if (!allowedTransitions[currentStatus].includes(newStatus)) {
       throw new Error(`Cannot transition from ${currentStatus} to ${newStatus}`);
     }
     
     // Update order
     await updateOrder(orderId, { status: newStatus });
   }
   ```

3. **Firestore Rules Validation:**
   ```
   // firestore.rules
   match /orders/{orderId} {
     allow update: if isAdmin() && validateStatusTransition(resource.data.status, request.resource.data.status);
   }
   
   function validateStatusTransition(currentStatus, newStatus) {
     let allowed = {
       'Pending': ['Processing', 'Cancelled'],
       'Processing': ['Shipped', 'Cancelled'],
       'Shipped': ['Delivered'],
     };
     return currentStatus in allowed && newStatus in allowed[currentStatus];
   }
   ```

**Acceptance Criteria:**
- ✅ Invalid transitions blocked (validation error)
- ✅ Admin UI only shows valid next states
- ✅ Firestore rules enforce transitions
- ✅ Cancelled/Delivered are terminal states (no further changes)

**Estimated Effort:** 1-2 days

---

### 2.3 Guard Seed Script (No Production Credentials)

**Current Risk:** 🟠 HIGH  
**Impact:** Someone runs populate script against production → admin account with known password exposed

**Files Affected:**
- [scripts/populateFirestore.ts](scripts/populateFirestore.ts) — Seed script
- [package.json](package.json) — populate-db script

**Current State:**
```typescript
// scripts/populateFirestore.ts
const adminEmail = "admin@mixostore.com";
const adminPassword = "Mixo123!";
// Script runs against ANY Firebase project (no guards)
```

**Changes Required:**

1. **Add Production Guard:**
   ```typescript
   // scripts/populateFirestore.ts
   if (process.env.FIREBASE_PROJECT_ID.includes('production')) {
     throw new Error(
       'REFUSING to run seed script against production database. ' +
       'If you REALLY want to populate production, set ALLOW_DB_SEED=true'
     );
   }
   
   if (process.env.ALLOW_DB_SEED !== 'true') {
     throw new Error(
       'This script is dangerous. Only run against local emulator or staging. ' +
       'Set ALLOW_DB_SEED=true if intentional.'
     );
   }
   ```

2. **Remove Hardcoded Credentials:**
   ```typescript
   // Before:
   const adminPassword = "Mixo123!";
   
   // After:
   const adminPassword = process.env.ADMIN_SEED_PASSWORD || 
     generateRandomPassword(); // Generate if not in env
   
   console.log('🔑 Admin credential (save this):');
   console.log(`Email: ${adminEmail}`);
   console.log(`Password: ${adminPassword}`);
   console.log('⚠️  This password will NOT be shown again.');
   ```

3. **Add Dryrun Mode:**
   ```typescript
   // Allow testing without actually writing
   if (process.env.DRY_RUN === 'true') {
     console.log('🧪 DRY RUN MODE - no data will be written');
     // Log what would be created but don't commit
   }
   ```

4. **Update Script in package.json:**
   ```json
   "populate-db": "NODE_ENV=development tsx scripts/populateFirestore.ts"
   ```

**Acceptance Criteria:**
- ✅ Script aborts if running against production
- ✅ Credentials are generated/from-env, not hardcoded
- ✅ Generated credentials printed only once
- ✅ Documentation warns about seed script danger

**Estimated Effort:** 1 day

---

### 2.4 Add Error Tracking (Sentry or Equivalent)

**Current Risk:** 🟠 HIGH  
**Impact:** Runtime errors, payment failures go unnoticed; bugs unreported

**Files Affected:**
- [next.config.ts](next.config.ts) — Sentry config
- [src/app/layout.tsx](src/app/layout.tsx) — Sentry provider
- [src/app/checkout/actions.ts](src/app/checkout/actions.ts) — Payment error tracking
- [src/app/api/payments/mpesa/callback](src/app/api/payments/mpesa/callback) — Webhook error tracking

**Setup Required:**

1. **Install Sentry:**
   ```bash
   npm install @sentry/nextjs @sentry/react
   npx @sentry/wizard@latest -i nextjs
   ```

2. **Configure Sentry Init:**
   - Get organization + project from [sentry.io](https://sentry.io)
   - Add `NEXT_PUBLIC_SENTRY_AUTH_TOKEN` to env

3. **Instrument Key Paths:**
   - Payment server actions → wrap with try/catch + captureException
   - Checkout webhook → log all failures
   - Admin mutations → log all privilege violations
   - Style Advisor AI calls → log timeouts/API errors

4. **Set Up Alerts:**
   - Email alert on new "Error" level event
   - Slack webhook for payment failures
   - Alert threshold: 5+ errors in 1 minute = page on-call

**Acceptance Criteria:**
- ✅ Sentry dashboard shows live errors
- ✅ Payment failures logged + alerted
- ✅ Webhook failures tracked
- ✅ Admin actions logged for audit

**Estimated Effort:** 1 day

---

### 2.5 Implement Audit Logs

**Current Risk:** 🟠 HIGH  
**Impact:** No accountability; cannot trace who changed what; regulatory/compliance risk

**Files Affected:**
- [src/lib/types.ts](src/lib/types.ts) — Add AuditLog type
- [src/app/admin/customers/[customerId]/actions.ts](src/app/admin/customers/[customerId]/actions.ts)
- [src/app/admin/products/[productId]/actions.ts](src/app/admin/products/[productId]/actions.ts)
- [src/app/admin/orders/[orderId]/actions.ts](src/app/admin/orders/[orderId]/actions.ts)

**Schema Required:**
```typescript
AuditLog = {
  id: string;
  event: 'ADMIN_ROLE_CHANGED' | 'PRODUCT_UPDATED' | 'ORDER_STATUS_CHANGED' | 'CUSTOMER_BLOCKED';
  adminId: string;
  targetId: string; // userID, productID, orderID, etc
  oldValue?: Record<string, any>;
  newValue: Record<string, any>;
  timestamp: Timestamp;
  ipAddress: string;
  userAgent: string;
}
```

**Collections:**
```
/auditLogs/{logId}
  - event: string
  - adminId: string
  - targetId: string
  - oldValue, newValue: objects
  - timestamp: Timestamp
  - ipAddress: string
  - userAgent: string
```

**Implementation:**
1. Create `logAuditEvent(event, adminId, target, oldValue, newValue)` utility
2. Call before every admin mutation
3. Firestore rules: audit logs immutable after creation
4. Admin dashboard: view audit log per resource

**Acceptance Criteria:**
- ✅ All admin actions logged
- ✅ Logs are immutable (no deletion/modification)
- ✅ Admin can view who changed what + when
- ✅ Timestamp + IP tracked

**Estimated Effort:** 1-2 days

---

## 🟡 TIER 3: MEDIUM PRIORITY (Week 2-3)

### 3.1 Real Search Engine

**Current Risk:** 🟡 MEDIUM  
**Impact:** Search is client-side filtering; doesn't scale; poor UX

**Options:**
- **Algolia** (recommended for e-commerce; easiest setup)
- **Meilisearch** (open-source; self-hosted option)
- **Typesense** (self-hosted; good performance)
- **Elastic** (most powerful; complex)

**Task:** Integrate Algolia as searchable index for products

**Estimated Effort:** 3-5 days

---

### 3.2 Basic Recommendations

**Current Risk:** 🟡 MEDIUM  
**Impact:** No personalization; missed upsell/cross-sell opportunity

**Algorithms to Implement:**
- Trending (top sellers last 7 days)
- Related products (same category + shared tags)
- Frequently bought together (from order data)

**Task:** Add recommendation API endpoints

**Estimated Effort:** 2-3 days

---

### 3.3 Promotions Engine

**Current Risk:** 🟡 MEDIUM  
**Impact:** Cannot run campaigns; no discount management

**Required Features:**
- Coupon CRUD
- Discount eligibility (min cart spend, category restrictions)
- Expiration + usage limits
- Stacking rules

**Estimated Effort:** 3-4 days

---

### 3.4 Shipping Zones & Rate Calculation

**Current Risk:** 🟡 MEDIUM  
**Impact:** Hard-coded shipping; cannot customize per region

**Required:**
- Shipping zones (Nairobi, Mombasa, Kisumu, Rest of Kenya, International)
- Rate calculation (weight-based, size-based, or flat fee)
- User-facing shipping calculator

**Estimated Effort:** 2-3 days

---

### 3.5 Two-Factor Authentication (2FA) for Admins

**Current Risk:** 🟡 MEDIUM  
**Impact:** Admin accounts vulnerable to password compromise

**Implementation:**
- TOTP (Time-based One-Time Password) via Google Authenticator/Authy
- Backup codes for recovery

**Estimated Effort:** 2 days

---

## 🟢 TIER 4: NICE-TO-HAVE (Post-Launch)

### 4.1 Observability Dashboards (Grafana/Datadog)

**Metrics:**
- Real-time checkout funnel
- Revenue per hour
- Payment success rate
- Firestore read/write costs

---

### 4.2 Legal Pages & Cookie Consent

**Required:**
- Terms of Service
- Privacy Policy
- Returns & Refunds policy
- Cookie consent banner

---

### 4.3 CSV Export & Advanced Reporting

**Features:**
- Export orders to CSV
- Export customer list
- Generate sales reports (daily/weekly/monthly)

---

### 4.4 Fulfillment Workflow UI

**Admin Features:**
- Pick list
- Packing slip generation
- Carrier integration (DHL, Fedex, etc.)
- Label printing

---

## 📊 Timeline & Dependencies

```
Week 1:
├─ Tier 1.1: TS/ESLint [PARALLEL with 1.2-1.7]
├─ Tier 1.2: App Check
├─ Tier 1.3: Firestore Rules
├─ Tier 1.4: Admin Auth
├─ Tier 1.5: Payment Idempotency
├─ Tier 1.6: Server-Side Totals
└─ Tier 1.7: Inventory Transactions

Week 2:
├─ Tier 2.1: CI/CD Pipeline [PARALLEL with 2.2-2.5]
├─ Tier 2.2: Order State Machine
├─ Tier 2.3: Guard Seed Script
├─ Tier 2.4: Error Tracking
└─ Tier 2.5: Audit Logs

Week 3:
├─ Tier 3.1: Search Engine [PARALLEL with 3.2-3.5]
├─ Tier 3.2: Recommendations
├─ Tier 3.3: Promotions
├─ Tier 3.4: Shipping Zones
└─ Tier 3.5: 2FA

PRODUCTION CUTOVER: After Tier 1 + 2 complete + manual smoke test
```

---

## ✅ Production Checklist

Before any production deployment:

- [ ] All Tier-1 issues resolved
- [ ] All Tier-2 issues resolved
- [ ] npm run build is clean (no errors)
- [ ] npm run typecheck reports 0 errors
- [ ] npm run lint reports 0 errors
- [ ] CI/CD pipeline passing all checks
- [ ] Manual smoke test passed (login → browse → add to cart → checkout)
- [ ] Payment test transaction successful (M-Pesa sandbox)
- [ ] Firestore rules deployed and tested
- [ ] App Check enabled and tested
- [ ] Error tracking (Sentry) working
- [ ] All environment variables configured in Vercel
- [ ] Staging environment mirrors production exactly
- [ ] Backup + recovery plan documented

---

## 📞 Contact & Escalation

- **Tech Lead:** [TBD]
- **Security Review:** Required before production
- **QA Sign-Off:** Required after Tier-2

---

**Last Updated:** March 19, 2026  
**Status:** 🔴 BLOCKING PRODUCTION DEPLOYMENT  
**Target Launch:** Week 3, March 2026
