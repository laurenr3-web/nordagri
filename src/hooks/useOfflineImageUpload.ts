
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNetworkState } from './useNetworkState';

// Interface for the image data
interface ImageData {
  id: string;
  base64Data: string;
  fileName: string;
  mimeType: string;
  size: number;
  localUrl: string;
}

export function useOfflineImageUpload() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const isOnline = useNetworkState();

  // Convert a File to base64 for local storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handle file selection
  const handleImageSelect = async (file: File): Promise<ImageData> => {
    try {
      // Convert to base64 for local storage
      const base64Data = await fileToBase64(file);
      
      // Create a unique ID for this image
      const imageId = uuidv4();
      
      // Create a local URL for display
      const localUrl = URL.createObjectURL(file);
      
      // Create the image data object
      const imageData: ImageData = {
        id: imageId,
        base64Data,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        localUrl
      };
      
      // Add to our state
      setImages(prev => [...prev, imageData]);
      
      // Store in localStorage for offline persistence
      const storedImages = localStorage.getItem('offline_images') || '[]';
      const parsedImages = JSON.parse(storedImages);
      localStorage.setItem('offline_images', JSON.stringify([...parsedImages, imageData]));
      
      return imageData;
    } catch (error) {
      console.error('Error processing image for offline storage:', error);
      throw error;
    }
  };

  // Upload images to server when online
  const uploadImages = async (bucketName: string): Promise<string[]> => {
    if (!isOnline || images.length === 0) {
      return images.map(img => img.localUrl);
    }
    
    setIsUploading(true);
    
    try {
      // Here you would implement the actual upload to Supabase storage
      // For each image in the images array
      
      const uploadedUrls: string[] = [];
      
      // Loop through images and upload them
      for (const image of images) {
        // Remove the data:image/jpeg;base64, prefix to get raw base64
        const base64WithoutPrefix = image.base64Data.split(',')[1];
        
        // Convert base64 to Blob
        const byteCharacters = atob(base64WithoutPrefix);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: image.mimeType });
        
        // Create File from Blob
        const file = new File([blob], image.fileName, { type: image.mimeType });
        
        // Upload to Supabase - implement this part when needed
        // const { data, error } = await supabase.storage
        //   .from(bucketName)
        //   .upload(`${uuidv4()}`, file);
        
        // if (error) throw error;
        
        // Use local URL for now as placeholder
        uploadedUrls.push(image.localUrl);
      }
      
      // Clear the images from state after successful upload
      setImages([]);
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Remove an image by ID
  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    
    // Also remove from localStorage
    const storedImages = localStorage.getItem('offline_images') || '[]';
    const parsedImages = JSON.parse(storedImages);
    localStorage.setItem(
      'offline_images', 
      JSON.stringify(parsedImages.filter((img: ImageData) => img.id !== id))
    );
  };

  // Load any previously stored images (e.g., on component mount)
  const loadStoredImages = () => {
    const storedImages = localStorage.getItem('offline_images');
    if (storedImages) {
      const parsedImages: ImageData[] = JSON.parse(storedImages);
      setImages(parsedImages);
    }
  };

  return {
    images,
    isUploading,
    handleImageSelect,
    uploadImages,
    removeImage,
    loadStoredImages
  };
}
