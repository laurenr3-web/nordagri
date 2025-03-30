
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service pour gérer les photos d'équipements dans Supabase Storage
 */
export const equipmentPhotoService = {
  /**
   * Upload une photo d'équipement dans le bucket Supabase
   */
  async uploadPhoto(file: File, equipmentId: number): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('equipment_photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Récupérer l'URL publique de l'image
      const { data: urlData } = supabase.storage
        .from('equipment_photos')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
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
      // Extraire le chemin du fichier de l'URL
      const baseUrl = supabase.storage.from('equipment_photos').getPublicUrl('').data.publicUrl;
      const filePath = photoUrl.replace(baseUrl, '');

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
   * Récupérer l'URL publique d'une photo
   */
  getPhotoUrl(filePath: string): string {
    const { data } = supabase.storage
      .from('equipment_photos')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
};
