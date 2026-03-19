
'use server';

import { getAdminFirestore } from '@/lib/firebase-admin';
import { sendOrderStatusUpdateEmail } from '@/lib/emailService';
import { writeAuditLog } from '@/lib/auditLog';
import type { Order } from '@/lib/types';

interface UpdateLogisticsArgs {
  orderId: string;
  status: Order['status'];
  trackingNumber?: string;
  customerEmail: string;
  customerName: string;
  adminUid?: string;
}

/** Valid order-status transitions (state machine). */
const ALLOWED_TRANSITIONS: Record<Order['status'], Order['status'][]> = {
  Pending:    ['Processing', 'Cancelled'],
  Processing: ['Shipped',    'Cancelled'],
  Shipped:    ['Delivered'],
  Delivered:  [],
  Cancelled:  [],
};

/**
 * Logistics Synchronization Action
 * Validates status transitions before writing to Firestore, then triggers
 * transactional customer alerts and appends an audit log entry.
 */
export async function updateOrderLogisticsAction(args: UpdateLogisticsArgs) {
  const { orderId, status, trackingNumber, customerEmail, customerName, adminUid } = args;

  try {
    const db = getAdminFirestore();
    const orderRef = db.collection('orders').doc(orderId);
    let previousStatus: Order['status'] = 'Pending';

    // Validate the status transition inside a transaction to prevent races.
    await db.runTransaction(async (trx) => {
      const snap = await trx.get(orderRef);
      if (!snap.exists) throw new Error('Order not found.');

      previousStatus = snap.data()!.status as Order['status'];
      if (previousStatus === status) {
        // No change – nothing to do.
        return;
      }
      const allowed = ALLOWED_TRANSITIONS[previousStatus] ?? [];
      if (!allowed.includes(status)) {
        throw new Error(
          `Invalid status transition: "${previousStatus}" → "${status}". ` +
          `Allowed: ${allowed.length ? allowed.join(', ') : 'none (terminal state)'}.`
        );
      }

      const updateData: Record<string, unknown> = {
        status,
        updatedAt: new Date().toISOString(),
      };
      if (trackingNumber !== undefined) {
        updateData.trackingNumber = trackingNumber;
      }

      trx.update(orderRef, updateData as any);
    });

    // Append audit log entry (non-blocking).
    writeAuditLog({
      action: 'order.status_updated',
      performedBy: adminUid ?? 'system',
      targetId: orderId,
      targetCollection: 'orders',
      details: { previousStatus, newStatus: status, trackingNumber },
    }).catch(() => {/* already logged inside writeAuditLog */});

    // Prepare serializable order object for email.
    const orderSnapshot = await orderRef.get();
    const orderData = { id: orderId, ...orderSnapshot.data() } as Order;

    const emailResult = await sendOrderStatusUpdateEmail(customerEmail, orderData, customerName);
    if (!emailResult.success) {
      console.warn('Logistics updated, but status email failed:', emailResult.error);
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Critical Logistics Failure:', error);
    return { success: false, error: message };
  }
}
