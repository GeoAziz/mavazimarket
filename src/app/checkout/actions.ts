
"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CartItem, Address, Order, User } from '@/lib/types';
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
  userId: string | null; // Nullable if guest checkout is allowed
  formData: CheckoutFormData;
  cartItems: CartItem[];
  totalAmount: number;
}

export async function placeOrderAction(args: PlaceOrderArgs): Promise<{ success: boolean; orderId?: string; error?: string }> {
  const { userId, formData, cartItems, totalAmount } = args;

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const shippingAddress: Address = {
    street: formData.address,
    city: formData.city,
    postalCode: formData.postalCode || '',
    country: 'Kenya', // Assuming Kenya for now
  };

  const orderData: Omit<Order, 'id'> = {
    userId: userId || 'guest', // Handle guest users
    orderDate: serverTimestamp(), // Firestore will set this
    status: 'Pending',
    items: cartItems,
    totalAmount,
    shippingAddress,
    paymentMethod: formData.paymentMethod,
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    console.log("Order placed with ID: ", docRef.id);

    // Send order confirmation email
    // Construct a temporary Order object with the ID and resolved timestamps for the email
    const confirmedOrderForEmail: Order = {
      ...orderData,
      id: docRef.id,
      orderDate: new Date().toISOString(), // Use current date for email, Firestore timestamp is server-side
      updatedAt: new Date().toISOString(),
    };

    const emailResult = await sendOrderConfirmationEmail(formData.email, confirmedOrderForEmail, formData.fullName);
    if (!emailResult.success) {
      console.warn("Order placed, but confirmation email failed to send:", emailResult.error);
      // You might want to log this for manual follow-up, but don't fail the whole order placement
    }

    // Here you would typically clear the user's cart (if using Firestore for cart)
    // or clear localStorage cart for guest/client-side cart.

    return { success: true, orderId: docRef.id };
  } catch (error),
    console.error("Error placing order: ", error);
    let errorMessage = "Failed to place order due to an unexpected error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
