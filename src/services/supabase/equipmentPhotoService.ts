import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { equipmentMultiPhotoService } from './equipmentMultiPhotoService';

/**
 * Service pour gérer les photos d'équipements dans Supabase Storage
 */
export const equipmentPhotoService = {
  /**
   * Upload une photo d'équipement - returns the storage path
   */
  async uploadPhoto(file: File, equipmentId: number): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${uuidv4()}.${fileExt}`;

      const { error } = await supabase.storage
        .from('equipment_photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Return the storage path (not public URL)
      return fileName;
    } catch (error) {
      console.error('Error uploading equipment photo:', error);
      throw error;
    }
  },

  /**
   * Supprimer une photo d'équipement
   */
  async deletePhoto(photoUrl: string): Promise<void> {
    try {
      const filePath = equipmentMultiPhotoService.extractStoragePath(photoUrl);

      const { error } = await supabase.storage
        .from('equipment_photos')
        .remove([filePath]);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting equipment photo:', error);
      throw error;
    }
  },

  /**
   * Récupérer une URL signée pour une photo
   */
  async getPhotoUrl(storagePath: string): Promise<string> {
    return equipmentMultiPhotoService.getSignedUrl(storagePath);
  }
};
