import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface EquipmentPhoto {
  id: string;
  equipment_id: number;
  photo_url: string; // Storage path (e.g. "1/uuid.jpg")
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Extracts the storage path from either a full public URL or a raw path.
 * Handles both legacy (full URL) and new (path-only) formats.
 */
function extractStoragePath(photoUrl: string): string {
  // If it's already a raw path (no http), return as-is
  if (!photoUrl.startsWith('http')) return photoUrl;
  
  // Extract path from full Supabase storage URL
  const marker = '/object/public/equipment_photos/';
  const idx = photoUrl.indexOf(marker);
  if (idx !== -1) return photoUrl.substring(idx + marker.length);
  
  // Try signed URL format
  const signedMarker = '/object/sign/equipment_photos/';
  const signedIdx = photoUrl.indexOf(signedMarker);
  if (signedIdx !== -1) {
    const pathWithQuery = photoUrl.substring(signedIdx + signedMarker.length);
    return pathWithQuery.split('?')[0];
  }
  
  return photoUrl;
}

/**
 * Generate a signed URL for a storage path. Valid for 1 hour.
 */
async function getSignedUrl(storagePath: string): Promise<string> {
  // Handle data URIs (base64) directly
  if (storagePath.startsWith('data:')) return storagePath;
  
  // Handle external URLs that aren't from our storage
  if (storagePath.startsWith('http') && !storagePath.includes('equipment_photos')) return storagePath;
  
  const path = extractStoragePath(storagePath);
  const { data, error } = await supabase.storage
    .from('equipment_photos')
    .createSignedUrl(path, 3600); // 1 hour

  if (error || !data?.signedUrl) {
    console.error('Error creating signed URL:', error);
    // Return empty string rather than throwing to avoid breaking UI
    return '';
  }
  return data.signedUrl;
}

/**
 * Service pour gérer plusieurs photos d'équipements
 */
export const equipmentMultiPhotoService = {
  extractStoragePath,
  getSignedUrl,

  /**
   * Récupérer toutes les photos d'un équipement avec URLs signées
   */
  async getEquipmentPhotos(equipmentId: number): Promise<EquipmentPhoto[]> {
    try {
      const { data, error } = await supabase
        .from('equipment_photos')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching equipment photos:', error);
      throw error;
    }
  },

  /**
   * Resolve signed URLs for a list of photos
   */
  async resolveSignedUrls(photos: EquipmentPhoto[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    
    // Batch create signed URLs
    const paths = photos.map(p => extractStoragePath(p.photo_url));
    const { data, error } = await supabase.storage
      .from('equipment_photos')
      .createSignedUrls(paths, 3600);
    
    if (error || !data) {
      console.error('Error creating signed URLs:', error);
      // Fallback: try individual
      for (const photo of photos) {
        const url = await getSignedUrl(photo.photo_url);
        urlMap.set(photo.id, url);
      }
      return urlMap;
    }
    
    data.forEach((item, idx) => {
      if (item.signedUrl) {
        urlMap.set(photos[idx].id, item.signedUrl);
      }
    });
    
    return urlMap;
  },

  /**
   * Upload une photo d'équipement - stores the storage path, not public URL
   */
  async uploadPhoto(file: File, equipmentId: number, displayOrder: number = 0, isPrimary: boolean = false): Promise<EquipmentPhoto> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('equipment_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Store the storage path (not public URL)
      const { data, error } = await supabase
        .from('equipment_photos')
        .insert({
          equipment_id: equipmentId,
          photo_url: fileName, // Store path only
          display_order: displayOrder,
          is_primary: isPrimary
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading equipment photo:', error);
      throw error;
    }
  },

  /**
   * Upload plusieurs photos
   */
  async uploadMultiplePhotos(files: File[], equipmentId: number): Promise<EquipmentPhoto[]> {
    try {
      const photos: EquipmentPhoto[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const photo = await this.uploadPhoto(files[i], equipmentId, i, i === 0);
        photos.push(photo);
      }
      
      return photos;
    } catch (error) {
      console.error('Error uploading multiple photos:', error);
      throw error;
    }
  },

  /**
   * Supprimer une photo
   */
  async deletePhoto(photoId: string, photoUrl: string): Promise<void> {
    try {
      const filePath = extractStoragePath(photoUrl);

      const { error: storageError } = await supabase.storage
        .from('equipment_photos')
        .remove([filePath]);

      if (storageError) throw storageError;

      const { error } = await supabase
        .from('equipment_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting equipment photo:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour l'ordre d'affichage des photos
   */
  async updateDisplayOrder(photoId: string, newOrder: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment_photos')
        .update({ display_order: newOrder })
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating photo order:', error);
      throw error;
    }
  },

  /**
   * Définir une photo comme photo principale
   */
  async setPrimaryPhoto(equipmentId: number, photoId: string): Promise<void> {
    try {
      await supabase
        .from('equipment_photos')
        .update({ is_primary: false })
        .eq('equipment_id', equipmentId);

      const { error } = await supabase
        .from('equipment_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error setting primary photo:', error);
      throw error;
    }
  }
};
