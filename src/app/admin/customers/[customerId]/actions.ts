'use server';

import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Administrative: Update User Role
 * Escalates or de-escalates a user's role in both Auth Custom Claims and Firestore.
 * Using Firebase Admin SDK Server Action.
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
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error("Admin Action Failure (Role):", error);
    return { success: false, error: error.message };
  }
}

/**
 * Administrative: Toggle Account Status
 * Enables or disables a user's ability to sign in to the platform.
 * Using Firebase Admin SDK Server Action.
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
    revalidatePath('/admin/customers');
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("Admin Action Failure (Status):", error);
    return { success: false, error: error.message };
  }
}

/**
 * Engagement: Send Promotional Email
 * Sends a heritage-themed offer to a specific customer using Resend.
 */
export async function sendPromotionalOfferAction(email: string, customerName: string, offerCode: string) {
  try {
    if (!process.env.RESEND_API_KEY) throw new Error("Engagement engine offline (Missing API Key)");

    const { data, error } = await resend.emails.send({
      from: 'Mavazi Market <heritage@mavazimarket.com>',
      to: email,
      subject: 'A Special Gift for Your Heritage Journey',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 12px;">
          <h1 style="color: #D4501A; text-align: center;">MAVAZI MARKET</h1>
          <p>Hello ${customerName},</p>
          <p>As a valued member of our community, we want to help you take the next step in your style path.</p>
          <div style="background: #FDF6EC; padding: 24px; border-radius: 8px; text-align: center; margin: 32px 0;">
            <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; margin-bottom: 8px;">Use your heritage code</p>
            <h2 style="color: #1A1A2E; margin: 0; font-size: 32px;">${offerCode}</h2>
            <p style="font-size: 14px; color: #666; margin-top: 8px;">Enjoy 15% OFF your next acquisition</p>
          </div>
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="background: #D4501A; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">SHOP THE COLLECTION</a>
          </p>
          <hr style="margin: 40px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 Mavazi Market. Nairobi, Kenya.</p>
        </div>
      `
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
