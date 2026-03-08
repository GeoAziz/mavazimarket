
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Robust Media Archiving Utility
 * Uploads a binary file to Firebase Storage and returns the permanent public URL.
 * 
 * @param file The file object from a form input or drop zone.
 * @param path The organizational path in the bucket (e.g., 'products', 'categories', 'reviews').
 */
export async function uploadImage(file: File, path: string): Promise<string> {
  if (!storage) {
    console.error("Critical Logistics Alert: Firebase Storage infrastructure is not initialized.");
    throw new Error("Cloud storage is currently offline. Please verify your environment variables.");
  }

  // 1. Generate a unique, collision-resistant filename
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 10);
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '-');
  const fullPath = `${path}/${timestamp}-${randomStr}-${cleanFileName}`;

  // 2. Create a reference to the specific cloud location
  const storageRef = ref(storage, fullPath);

  try {
    // 3. Perform the binary upload
    // We use uploadBytes for simple client-side uploads. 
    // For large files (>10MB), uploadBytesResumable would be preferred.
    const snapshot = await uploadBytes(storageRef, file);
    
    // 4. Retrieve the permanent, signed download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log(`Logistics Success: Archived heritage asset to ${fullPath}`);
    return downloadURL;
  } catch (error: any) {
    console.error("Media Archive Failure:", error);
    throw new Error(`Failed to archive asset: ${error.message || 'Unknown network error'}`);
  }
}
