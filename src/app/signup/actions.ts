
'use server'

import { getAdminFirestore } from '@/lib/firebase-admin';

interface UserData {
  fullName: string;
  email: string;
}

/**
 * Professional User Profile Creation
 * Creates a robust user document in Firestore following the March 2026 blueprint.
 * Uses the Admin SDK for secure, elevated writes during registration.
 */
export async function handleUserSignupCompletion(
  userId: string, 
  userData: UserData
) {
  try {
    const db = getAdminFirestore();
    
    // Split name into first and last for the blueprint data model
    const nameParts = userData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const userProfile = {
      uid: userId,
      email: userData.email,
      name: userData.fullName,
      firstName,
      lastName,
      role: 'user', // Default role
      isBlocked: false,
      wishlist: [],
      shippingAddress: {
        street: '',
        city: '',
        postalCode: '',
        country: 'Kenya'
      },
      photoURL: `https://placehold.co/128x128.png?text=${firstName.charAt(0)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(userId).set(userProfile);

    return { success: true };
  } catch (error) {
    console.error('CRITICAL: Error in handleUserSignupCompletion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Infrastructure failure during profile creation.'
    };
  }
}
