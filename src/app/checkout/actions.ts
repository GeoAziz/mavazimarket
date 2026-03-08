
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import type { CartItem, Address, Order } from '@/lib/types';
import { sendOrderConfirmationEmail } from '@/lib/emailService';

interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode?: string;
  paymentMethod: "mpesa" | "card" | "paypal";
}

interface PlaceOrderArgs {
  userId: string | null;
  formData: CheckoutFormData;
  cartItems: CartItem[];
  totalAmount: number;
}

/**
 * placeOrderAction - The Core Revenue Generator
 * 
 * This function performs the "Hard Write" to Firestore. 
 * It snapshots the current state of items to ensure price consistency even if the catalog changes.
 */
export async function placeOrderAction(args: PlaceOrderArgs): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const { userId, formData, cartItems, totalAmount } = args;

  if (!db) {
    return { success: false, error: "Infrastructure Offline: Database not connected." };
  }

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Validation Failed: Your shopping bag is empty." };
  }

  // 1. Prepare Shipping Payload
  const shippingAddress: Address = {
    street: formData.address,
    city: formData.city,
    postalCode: formData.postalCode || '00100',
    country: 'Kenya',
    phone: formData.phone
  };

  // 2. Prepare Order Document
  // Note: We snapshot items here so the order record remains accurate forever
  const orderData = {
    userId: userId || 'guest_checkout',
    orderDate: serverTimestamp(),
    status: 'Pending' as const,
    items: cartItems.map(item => ({
      id: item.id,
      productId: item.productId || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      size: item.size || 'OS',
      color: item.color || 'Default',
      slug: item.slug || ''
    })),
    totalAmount,
    shippingAddress,
    paymentMethod: formData.paymentMethod,
    mpesaTransactionId: formData.paymentMethod === 'mpesa' ? `MAV-MPESA-${Date.now().toString().slice(-6)}` : undefined,
    updatedAt: serverTimestamp(),
  };

  try {
    // 3. Persist to Firestore
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, orderData);
    
    // 4. Trigger Transactional Confirmation (Non-blocking)
    const confirmedOrderForEmail: Order = {
      ...orderData,
      id: docRef.id,
      orderDate: new Date().toISOString(), // String representation for the email template
      updatedAt: new Date().toISOString(),
    } as any;

    // We don't await the email to ensure the user gets a fast redirect
    sendOrderConfirmationEmail(formData.email, confirmedOrderForEmail, formData.fullName)
      .catch(e => console.error("Transactional Email Failed:", e));

    return { 
      success: true, 
      orderId: docRef.id 
    };
  } catch (error: any) {
    console.error("Critical Logistics Failure during checkout:", error);
    return { 
      success: false, 
      error: error.message || "A logistics error occurred while archiving your order. Our team has been notified." 
    };
  }
}
