
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface SubmitReviewArgs {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images?: string[];
  slug: string;
}

/**
 * Heritage Review Submission
 * Creates a review in the product's sub-collection and updates the parent aggregate rating and review count.
 * Fulfills the real-time feedback loop requirement of the March 2026 blueprint.
 */
export async function submitProductReviewAction(args: SubmitReviewArgs) {
  const { productId, userId, userName, rating, comment, images, slug } = args;

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
      images: images || [],
      date: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // 2. Real Logic for Updating Aggregate Rating
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
        const productData = productSnap.data();
        const currentRating = productData.averageRating || 0;
        const currentCount = productData.reviewCount || 0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + rating) / newCount;
        
        await updateDoc(productRef, {
            averageRating: Number(newRating.toFixed(1)),
            reviewCount: newCount,
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

/**
 * deleteProductReviewAction
 * Administrative: Decommission a review and adjust the product's aggregate rating.
 */
export async function deleteProductReviewAction(args: { productId: string, reviewId: string, rating: number, slug: string }) {
  const { productId, reviewId, rating, slug } = args;

  try {
    if (!db) throw new Error("Database not connected");

    const productRef = doc(db, 'products', productId);
    const reviewRef = doc(productRef, 'reviews', reviewId);

    // 1. Delete the review doc
    await deleteDoc(reviewRef);

    // 2. Adjust parent aggregate rating
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      const productData = productSnap.data();
      const currentRating = productData.averageRating || 0;
      const currentCount = productData.reviewCount || 0;

      const newCount = Math.max(0, currentCount - 1);
      let newRating = 0;
      
      if (newCount > 0) {
        // Reverse the weighted average calculation
        newRating = ((currentRating * currentCount) - rating) / newCount;
      }

      await updateDoc(productRef, {
        averageRating: Number(newRating.toFixed(1)),
        reviewCount: newCount,
        updatedAt: serverTimestamp(),
      });
    }

    revalidatePath(`/products/${slug}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting review:", error);
    return { success: false, error: error.message };
  }
}
