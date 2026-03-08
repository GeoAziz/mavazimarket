
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * Fulfills the "High-End Media Management" requirement of the blueprint.
 * 
 * @param file The heritage asset to upload.
 * @param path The classification path (e.g., 'products', 'categories').
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) {
    console.warn("Storage Sync Failure: Firebase Storage is not initialized.");
    // Fallback for development if storage isn't ready
    return `https://placehold.co/600x800.png?text=Pending+Upload`;
  }

  // Create a unique, URL-safe classification for the heritage asset
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const storageRef = ref(storage, `${path}/${uniqueId}-${safeFileName}`);

  try {
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Heritage Archive Failure:", error);
    throw new Error("Failed to archive visual asset to the cloud. Please verify storage permissions.");
  }
}
