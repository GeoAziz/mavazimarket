
'use server';

import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { revalidatePath } from 'next/cache';

interface BulkProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  brand?: string;
  material?: string;
  stockQuantity: number;
  sizes?: string[];
  colors?: string[];
  tags?: string[];
  images?: string[];
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7);
};

/**
 * Bulk Acquisition Action
 * Processes a batch of product records using Firestore atomic batches.
 * Fulfills the Phase 2 scaling requirements of the March 2026 blueprint.
 */
export async function bulkCreateProductsAction(products: BulkProductData[]) {
  try {
    if (!db) throw new Error("Infrastructure Offline: Database not connected.");
    
    const batch = writeBatch(db);
    const productsRef = collection(db, "products");

    products.forEach((product) => {
      const newDocRef = doc(productsRef);
      const slug = generateSlug(product.name);
      
      batch.set(newDocRef, {
        ...product,
        slug,
        isPublished: true,
        averageRating: 0,
        reviewCount: 0,
        images: product.images || ['https://placehold.co/600x800.png?text=Heritage+Pending'],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    revalidatePath('/admin/products');
    revalidatePath('/');
    
    return { success: true, count: products.length };
  } catch (error: any) {
    console.error("Bulk Logistics Failure:", error);
    return { success: false, error: error.message };
  }
}
