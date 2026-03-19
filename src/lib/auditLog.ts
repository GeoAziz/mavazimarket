'use server';

import { getAdminFirestore } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export type AuditAction =
  | 'order.status_updated'
  | 'user.role_changed'
  | 'user.status_toggled'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'order.created';

interface AuditLogEntry {
  action: AuditAction;
  performedBy: string; // admin UID or 'system'
  targetId: string;    // affected document ID
  targetCollection: string;
  details?: Record<string, unknown>;
}

/**
 * writeAuditLog – Appends an immutable audit entry to the /auditLogs collection.
 * This function should only be called from server actions (Admin SDK).
 * Firestore rules block all client writes to /auditLogs.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  try {
    const db = getAdminFirestore();
    await db.collection('auditLogs').add({
      ...entry,
      timestamp: FieldValue.serverTimestamp(),
    });
  } catch (err) {
    // Audit failures should not break the primary action – log only.
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}
