import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  UploadResult
} from 'firebase/storage';
import { storage } from '../client';

export class StorageService {
  /**
   * Uploads a raw File or Blob to a target path in Firebase Storage
   */
  static async uploadFile(path: string, file: File | Blob): Promise<UploadResult> {
    try {
      const storageRef = ref(storage, path);
      return await uploadBytes(storageRef, file);
    } catch (error) {
      console.error(`Firebase Storage upload failure at path ${path}:`, error);
      throw error;
    }
  }

  /**
   * Resolves the secure public download URL for a given storage path
   */
  static async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Firebase Storage download URL resolution failure at path ${path}:`, error);
      throw error;
    }
  }

  /**
   * Hard deletes an object from Storage by its path
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error(`Firebase Storage delete failure at path ${path}:`, error);
      throw error;
    }
  }

  /**
   * Lists all files nested within a designated storage directory prefix
   */
  static async listFiles(path: string): Promise<string[]> {
    try {
      const storageRef = ref(storage, path);
      const res = await listAll(storageRef);
      return res.items.map((item) => item.fullPath);
    } catch (error) {
      console.error(`Firebase Storage list files failure at path ${path}:`, error);
      throw error;
    }
  }
}
