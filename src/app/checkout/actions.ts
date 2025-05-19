"use server";

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CartItem, Address, Order } from '@/lib/types'; // User type not needed here directly
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
  cartItems: CartItem[]; // Expecting dynamic cart items
  totalAmount: number;   // Expecting dynamic total amount
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
    country: 'Kenya', 
  };

  const orderData: Omit<Order, 'id'> = {
    userId: userId || 'guest_user', // Mark guest orders explicitly if needed
    orderDate: serverTimestamp(), 
    status: 'Pending',
    items: cartItems.map(item => ({ // Ensure we only store necessary fields from CartItem
        id: item.productId || item.id, // Prefer productId if available (actual product ref)
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        size: item.size,
        color: item.color,
        slug: item.slug,
        productId: item.productId || item.id,
    })),
    totalAmount,
    shippingAddress,
    paymentMethod: formData.paymentMethod,
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(collection(db, "orders"), orderData);
    console.log("Order placed with ID: ", docRef.id);

    const confirmedOrderForEmail: Order = {
      ...orderData,
      id: docRef.id,
      orderDate: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    };

    const emailResult = await sendOrderConfirmationEmail(formData.email, confirmedOrderForEmail, formData.fullName);
    if (!emailResult.success) {
      console.warn("Order placed, but confirmation email failed to send:", emailResult.error);
    }
    
    // IMPORTANT: Clearing the cart should be handled on the client-side after this action successfully returns.
    // This server action cannot directly modify client-side CartContext or localStorage.
    // The client will call cartContext.clearCart().
    // If the cart was also in Firestore, this action *could* delete it, but it's safer if client triggers clear.

    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error placing order: ", error);
    let errorMessage = "Failed to place order due to an unexpected error.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
