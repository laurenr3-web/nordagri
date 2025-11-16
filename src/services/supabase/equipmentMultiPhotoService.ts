import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface EquipmentPhoto {
  id: string;
  equipment_id: number;
  photo_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Service pour gérer plusieurs photos d'équipements
 */
export const equipmentMultiPhotoService = {
  /**
   * Récupérer toutes les photos d'un équipement
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
   * Upload une photo d'équipement
   */
  async uploadPhoto(file: File, equipmentId: number, displayOrder: number = 0, isPrimary: boolean = false): Promise<EquipmentPhoto> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentId}/${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload vers Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('equipment_photos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('equipment_photos')
        .getPublicUrl(filePath);

      // Créer l'enregistrement dans la table
      const { data, error } = await supabase
        .from('equipment_photos')
        .insert({
          equipment_id: equipmentId,
          photo_url: urlData.publicUrl,
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
      // Extraire le chemin du fichier de l'URL
      const baseUrl = supabase.storage.from('equipment_photos').getPublicUrl('').data.publicUrl;
      const filePath = photoUrl.replace(baseUrl, '');

      // Supprimer du storage
      const { error: storageError } = await supabase.storage
        .from('equipment_photos')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Supprimer l'enregistrement
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
      // Retirer le statut primaire de toutes les photos
      await supabase
        .from('equipment_photos')
        .update({ is_primary: false })
        .eq('equipment_id', equipmentId);

      // Définir la nouvelle photo principale
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
