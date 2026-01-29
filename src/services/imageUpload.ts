import { supabase } from '@/lib/supabase';

export class ImageUploadService {
  private static readonly BUCKET_NAME = 'crop-images';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Please upload JPEG, PNG, or WebP images only.'
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size too large. Please upload images smaller than 5MB.'
      };
    }

    return { valid: true };
  }

  /**
   * Upload a single image file
   */
  static async uploadImage(file: File, userId: string): Promise<{ url: string | null; error?: string }> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { url: null, error: validation.error };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

      // Upload file
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return { url: null, error: `Failed to upload image: ${error.message}` };
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      console.log('Public URL:', publicUrl);

      return { url: publicUrl };
    } catch (error) {
      console.error('Upload error:', error);
      return { url: null, error: 'Failed to upload image. Please try again.' };
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadImages(files: File[], userId: string): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const result = await this.uploadImage(file, userId);
      if (result.url) {
        urls.push(result.url);
      } else {
        errors.push(result.error || 'Unknown error');
      }
    }

    return { urls, errors };
  }

  /**
   * Delete an image from storage
   */
  static async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(part => part === this.BUCKET_NAME);
      
      if (bucketIndex === -1) {
        console.error('Invalid image URL format');
        return false;
      }

      const filePath = pathParts.slice(bucketIndex + 1).join('/');

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple images
   */
  static async deleteImages(imageUrls: string[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const url of imageUrls) {
      const deleted = await this.deleteImage(url);
      if (deleted) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }
}