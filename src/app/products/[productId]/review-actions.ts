
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface SubmitReviewArgs {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  slug: string;
}

/**
 * Heritage Review Submission
 * Creates a review in the product's sub-collection and updates the parent aggregate rating.
 */
export async function submitProductReviewAction(args: SubmitReviewArgs) {
  const { productId, userId, userName, rating, comment, slug } = args;

  try {
    if (!db) throw new Error("Database not connected");

    const productRef = doc(db, 'products', productId);
    const reviewsRef = collection(productRef, 'reviews');

    // 1. Add the review to the sub-collection
    await addDoc(reviewsRef, {
      productId,
      userId,
      userName,
      rating,
      comment,
      date: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Mock Logic for Updating Aggregate Rating (in real production this would be a Cloud Function)
    // For MVP, we'll do a simple update if the doc exists
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
        const currentRating = productSnap.data().averageRating || 0;
        const totalReviews = 10; // Mock count for now or fetch actual count
        const newRating = ((currentRating * totalReviews) + rating) / (totalReviews + 1);
        
        await updateDoc(productRef, {
            averageRating: Number(newRating.toFixed(1)),
            updatedAt: serverTimestamp(),
        });
    }

    revalidatePath(`/products/${slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return { success: false, error: error.message };
  }
}
