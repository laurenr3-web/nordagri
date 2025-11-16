import { useState, useEffect } from 'react';
import { equipmentMultiPhotoService, EquipmentPhoto } from '@/services/supabase/equipmentMultiPhotoService';
import { toast } from 'sonner';

export const useEquipmentPhotos = (equipmentId: number | undefined) => {
  const [photos, setPhotos] = useState<EquipmentPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Charger les photos
  const loadPhotos = async () => {
    if (!equipmentId) {
      setPhotos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await equipmentMultiPhotoService.getEquipmentPhotos(equipmentId);
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [equipmentId]);

  // Upload de photos
  const uploadPhotos = async (files: File[]) => {
    if (!equipmentId) return;

    try {
      setUploading(true);
      const newPhotos = await equipmentMultiPhotoService.uploadMultiplePhotos(files, equipmentId);
      setPhotos([...photos, ...newPhotos]);
      toast.success(`${newPhotos.length} photo(s) ajoutée(s)`);
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Erreur lors de l\'upload des photos');
    } finally {
      setUploading(false);
    }
  };

  // Supprimer une photo
  const deletePhoto = async (photoId: string, photoUrl: string) => {
    try {
      await equipmentMultiPhotoService.deletePhoto(photoId, photoUrl);
      setPhotos(photos.filter(p => p.id !== photoId));
      toast.success('Photo supprimée');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Définir photo principale
  const setPrimaryPhoto = async (photoId: string) => {
    if (!equipmentId) return;

    try {
      await equipmentMultiPhotoService.setPrimaryPhoto(equipmentId, photoId);
      setPhotos(photos.map(p => ({
        ...p,
        is_primary: p.id === photoId
      })));
      toast.success('Photo principale définie');
    } catch (error) {
      console.error('Error setting primary photo:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return {
    photos,
    loading,
    uploading,
    uploadPhotos,
    deletePhoto,
    setPrimaryPhoto,
    refreshPhotos: loadPhotos
  };
};
