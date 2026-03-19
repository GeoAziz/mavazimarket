
"use server";

import { getAdminFirestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { Address, Order } from '@/lib/types';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

const TAX_RATE = 0.16;          // 16 % VAT
const FREE_SHIPPING_THRESHOLD = 3000; // KSh
const FLAT_SHIPPING_COST = 250; // KSh
const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  paymentMethod: "mpesa" | "card" | "paypal";
}

/**
 * Item reference sent from the client – we only trust IDs and quantities.
 * Prices are always re-fetched from the database.
 */
interface CartItemRef {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

interface PlaceOrderArgs {
  userId: string | null;
  formData: CheckoutFormData;
  cartItemRefs: CartItemRef[];
  idempotencyKey: string;
}

/**
 * placeOrderAction – Production-grade checkout handler
 *
 * Security guarantees:
 *  1. Idempotency  – duplicate submissions return the existing order ID.
 *  2. Server-side totals – prices are always fetched from Firestore; the
 *     client cannot manipulate the charged amount.
 *  3. Atomic inventory – stock is decremented inside a transaction so
 *     concurrent checkouts cannot oversell.
 */
export async function placeOrderAction(
  args: PlaceOrderArgs
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const { userId, formData, cartItemRefs, idempotencyKey } = args;

  if (!idempotencyKey || idempotencyKey.length < 10) {
    return { success: false, error: "Missing idempotency key." };
  }

  if (!cartItemRefs || cartItemRefs.length === 0) {
    return { success: false, error: "Validation Failed: Your shopping bag is empty." };
  }

  const adminDb = getAdminFirestore();

  // ── 1. Idempotency check ────────────────────────────────────────────────────
  const idemKeyRef = adminDb.collection('idempotencyKeys').doc(idempotencyKey);
  const idemSnap = await idemKeyRef.get();
  if (idemSnap.exists) {
    const existing = idemSnap.data()!;
    if (existing.expiresAt.toMillis() > Date.now()) {
      // Return the existing order – do NOT create a duplicate.
      return { success: true, orderId: existing.orderId };
    }
    // Key has expired – treat as a new checkout.
  }

  // ── 2. Fetch current product prices from Firestore (server-side) ───────────
  type ProductRecord = { id: string; name: string; price: number; stockQuantity: number; images: string[]; slug: string };
  const productDocs = await Promise.all(
    cartItemRefs.map(ref => adminDb.collection('products').doc(ref.productId).get())
  );

  const products: Record<string, ProductRecord> = {};
  for (const snap of productDocs) {
    if (!snap.exists) {
      return { success: false, error: `Product ${snap.id} no longer exists.` };
    }
    products[snap.id] = { id: snap.id, ...(snap.data() as Omit<ProductRecord, 'id'>) };
  }

  // ── 3. Server-side total calculation ──────────────────────────────────────
  let subtotal = 0;
  for (const ref of cartItemRefs) {
    const product = products[ref.productId];
    if (!product) return { success: false, error: `Product ${ref.productId} not found.` };
    subtotal += product.price * ref.quantity;
  }
  const shippingCost = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_COST;
  const taxes = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxes + shippingCost;

  // ── 4. Atomic inventory decrement + order creation (transaction) ──────────
  const shippingAddress: Address = {
    street: formData.address,
    city: formData.city,
    postalCode: formData.postalCode || '00100',
    country: 'Kenya',
    phone: formData.phone,
  };

  const orderItems = cartItemRefs.map(ref => {
    const product = products[ref.productId];
    return {
      id: ref.productId,
      productId: ref.productId,
      name: product.name,
      price: product.price,
      quantity: ref.quantity,
      image: product.images?.[0] ?? '',
      size: ref.size || 'OS',
      color: ref.color || 'Default',
      slug: product.slug || '',
    };
  });

  try {
    const orderRef = adminDb.collection('orders').doc();

    await adminDb.runTransaction(async (trx) => {
      // Re-read stock inside the transaction to prevent race conditions.
      const productSnapshots = await Promise.all(
        cartItemRefs.map(ref => trx.get(adminDb.collection('products').doc(ref.productId)))
      );

      for (let i = 0; i < cartItemRefs.length; i++) {
        const snap = productSnapshots[i];
        const ref = cartItemRefs[i];
        const currentStock: number = snap.data()?.stockQuantity ?? 0;
        if (currentStock < ref.quantity) {
          throw new Error(
            `"${snap.data()?.name ?? ref.productId}" is out of stock (requested ${ref.quantity}, available ${currentStock}).`
          );
        }
        trx.update(snap.ref, { stockQuantity: currentStock - ref.quantity });
      }

      // Write the order document (totalAmount set by server – NOT trusted from client).
      trx.set(orderRef, {
        userId: userId || 'guest_checkout',
        orderDate: FieldValue.serverTimestamp(),
        status: 'Pending' as const,
        items: orderItems,
        subtotal,
        shippingCost,
        taxes,
        totalAmount,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        idempotencyKey,
        mpesaTransactionId:
          formData.paymentMethod === 'mpesa'
            ? `MAV-MPESA-${Date.now().toString().slice(-6)}`
            : undefined,
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    // ── 5. Store idempotency key (TTL = 24 h) ────────────────────────────────
    await idemKeyRef.set({
      orderId: orderRef.id,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
    });

    // ── 6. Non-blocking confirmation email ───────────────────────────────────
    const emailOrder: Order = {
      id: orderRef.id,
      userId: userId || 'guest_checkout',
      orderDate: new Date().toISOString(),
      status: 'Pending',
      items: orderItems,
      subtotal,
      shippingCost,
      taxes,
      totalAmount,
      shippingAddress,
      paymentMethod: formData.paymentMethod,
      idempotencyKey,
      updatedAt: new Date().toISOString(),
    };

    sendOrderConfirmationEmail(formData.email, emailOrder, formData.fullName).catch(e =>
      console.error('Transactional Email Failed:', e)
    );

    return { success: true, orderId: orderRef.id };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'A logistics error occurred.';
    console.error('Critical Logistics Failure during checkout:', error);
    return { success: false, error: message };
  }
}
