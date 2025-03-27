
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Uploads an equipment image to Supabase Storage
 * @param file The image file to upload
 * @returns The public URL of the uploaded image
 */
export async function uploadEquipmentImage(file: File): Promise<string> {
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `equipment/${fileName}`;
    
    console.log(`Uploading equipment image: ${filePath}`);
    
    // Check if the storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const equipmentBucket = buckets?.find(bucket => bucket.name === 'equipment');
    
    // Create bucket if it doesn't exist
    if (!equipmentBucket) {
      console.log('Creating equipment bucket...');
      const { error: createBucketError } = await supabase.storage.createBucket('equipment', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating equipment bucket:', createBucketError);
        throw createBucketError;
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from('equipment')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (uploadError) {
      console.error('Error uploading equipment image:', uploadError);
      throw uploadError;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('equipment')
      .getPublicUrl(filePath);
    
    console.log('Image uploaded successfully:', publicUrlData.publicUrl);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadEquipmentImage:', error);
    throw error;
  }
}

/**
 * Deletes an equipment image from Supabase Storage
 * @param imagePath The path of the image to delete
 */
export async function deleteEquipmentImage(imagePath: string): Promise<void> {
  try {
    // Extract the path from the full URL if needed
    const pathRegex = /equipment\/(.+)$/;
    const match = imagePath.match(pathRegex);
    const path = match ? match[0] : imagePath;
    
    console.log(`Deleting equipment image: ${path}`);
    
    const { error } = await supabase.storage
      .from('equipment')
      .remove([path]);
    
    if (error) {
      console.error('Error deleting equipment image:', error);
      throw error;
    }
    
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error in deleteEquipmentImage:', error);
    throw error;
  }
}

/**
 * Checks if a URL is a data URL
 * @param url The URL to check
 * @returns True if the URL is a data URL, false otherwise
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Converts a data URL to a File object
 * @param dataUrl The data URL to convert
 * @param filename The filename to use
 * @returns A File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}
