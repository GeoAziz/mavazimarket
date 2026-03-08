
'use server';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';

/**
 * Administrative: Update User Role
 * Escalates or de-escalates a user's role in both Auth Custom Claims and Firestore.
 */
export async function updateCustomerRoleAction(userId: string, newRole: 'user' | 'admin') {
  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();

    // 1. Set Custom Claims for Auth Security
    await auth.setCustomUserClaims(userId, { 
      admin: newRole === 'admin',
      role: newRole 
    });

    // 2. Sync with Firestore Profile
    await db.collection('users').doc(userId).update({
      role: newRole,
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/admin/customers/${userId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Admin Action Failure (Role):", error);
    return { success: false, error: error.message };
  }
}

/**
 * Administrative: Toggle Account Status
 * Enables or disables a user's ability to sign in to the platform.
 */
export async function toggleCustomerStatusAction(userId: string, currentDisabledStatus: boolean) {
  try {
    const auth = getAdminAuth();
    const db = getAdminFirestore();
    const newStatus = !currentDisabledStatus;

    // 1. Update Auth status
    await auth.updateUser(userId, { disabled: newStatus });

    // 2. Update Firestore profile
    await db.collection('users').doc(userId).update({
      disabled: newStatus,
      updatedAt: new Date().toISOString()
    });

    revalidatePath(`/admin/customers/${userId}`);
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("Admin Action Failure (Status):", error);
    return { success: false, error: error.message };
  }
}
