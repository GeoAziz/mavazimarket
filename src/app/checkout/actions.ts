
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
 * Professional Checkout & Order Creation
 * Handles real Firestore order document creation with full March 2026 lifecycle fields.
 */
export async function placeOrderAction(args: PlaceOrderArgs): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const { userId, formData, cartItems, totalAmount } = args;

  if (!db) return { success: false, error: "Database not connected" };
  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your bag is empty." };
  }

  const shippingAddress: Address = {
    street: formData.address,
    city: formData.city,
    postalCode: formData.postalCode || '00100',
    country: 'Kenya',
    phone: formData.phone
  };

  // Build the rich order document according to the blueprint
  const orderData: Omit<Order, 'id'> = {
    userId: userId || 'guest_checkout',
    orderDate: serverTimestamp(), 
    status: 'Pending',
    items: cartItems.map(item => ({
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size,
        color: item.color,
        slug: item.slug,
    })),
    totalAmount,
    shippingAddress,
    paymentMethod: formData.paymentMethod,
    // Add March 2026 placeholder fields for payment integration
    mpesaTransactionId: formData.paymentMethod === 'mpesa' ? `MOCK-${Date.now()}` : undefined,
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    
    // Prepare serializable order object for email
    const confirmedOrderForEmail: Order = {
      ...orderData,
      id: docRef.id,
      orderDate: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    };

    const emailResult = await sendOrderConfirmationEmail(formData.email, confirmedOrderForEmail, formData.fullName);
    if (!emailResult.success) {
      console.warn("Order placed, but heritage confirmation email failed:", emailResult.error);
    }
    
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error placing order: ", error);
    return { success: false, error: error instanceof Error ? error.message : "Logistics failure." };
  }
}
