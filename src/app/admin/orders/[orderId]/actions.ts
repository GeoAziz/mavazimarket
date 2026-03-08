
'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { sendOrderStatusUpdateEmail } from '@/lib/emailService';
import type { Order } from '@/lib/types';

interface UpdateLogisticsArgs {
  orderId: string;
  status: Order['status'];
  trackingNumber?: string;
  customerEmail: string;
  customerName: string;
}

/**
 * Logistics Synchronization Action
 * Updates Firestore document and triggers transactional customer alerts.
 * Fulfills the professional order lifecycle requirements of the March 2026 blueprint.
 */
export async function updateOrderLogisticsAction(args: UpdateLogisticsArgs) {
  const { orderId, status, trackingNumber, customerEmail, customerName } = args;

  try {
    const db = getAdminFirestore();
    const orderRef = db.collection('orders').doc(orderId);

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (trackingNumber !== undefined) {
      updateData.trackingNumber = trackingNumber;
    }

    await orderRef.update(updateData);

    // Prepare serializable order object for email
    const orderSnapshot = await orderRef.get();
    const orderData = { id: orderId, ...orderSnapshot.data() } as Order;

    const emailResult = await sendOrderStatusUpdateEmail(customerEmail, orderData, customerName);
    
    if (!emailResult.success) {
      console.warn("Logistics updated, but status email failed:", emailResult.error);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Critical Logistics Failure:", error);
    return { success: false, error: error.message };
  }
}
