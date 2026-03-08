
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * High-End Media Management
 * Uploads a file to Firebase Storage and returns the permanent download URL.
 * 
 * @param file The heritage visual asset to upload.
 * @param path The classification path (e.g., 'products', 'categories').
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) {
    console.error("Logistics Alert: Firebase Storage is not initialized.");
    throw new Error("Cloud storage infrastructure is unavailable. Please verify environment variables.");
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
    console.error("Media Archive Failure:", error);
    throw new Error("Failed to archive visual asset to the cloud. Please verify storage permissions.");
  }
}
