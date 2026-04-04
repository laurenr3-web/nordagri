import { useState, useEffect, useCallback } from 'react';
import { equipmentMultiPhotoService, EquipmentPhoto } from '@/services/supabase/equipmentMultiPhotoService';
import { toast } from 'sonner';

export const useEquipmentPhotos = (equipmentId: number | undefined) => {
  const [photos, setPhotos] = useState<EquipmentPhoto[]>([]);
  const [signedUrls, setSignedUrls] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Charger les photos et résoudre les URLs signées
  const loadPhotos = useCallback(async () => {
    if (!equipmentId) {
      setPhotos([]);
      setSignedUrls(new Map());
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await equipmentMultiPhotoService.getEquipmentPhotos(equipmentId);
      setPhotos(data);

      // Resolve signed URLs for all photos
      if (data.length > 0) {
        const urls = await equipmentMultiPhotoService.resolveSignedUrls(data);
        setSignedUrls(urls);
      } else {
        setSignedUrls(new Map());
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      toast.error('Erreur lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  /**
   * Get the display URL for a photo (signed URL or fallback)
   */
  const getDisplayUrl = useCallback((photo: EquipmentPhoto): string => {
    return signedUrls.get(photo.id) || '';
  }, [signedUrls]);

  // Upload de photos
  const uploadPhotos = async (files: File[]) => {
    if (!equipmentId) return;

    try {
      setUploading(true);
      const newPhotos = await equipmentMultiPhotoService.uploadMultiplePhotos(files, equipmentId);
      
      // Resolve signed URLs for new photos
      const newUrls = await equipmentMultiPhotoService.resolveSignedUrls(newPhotos);
      
      setPhotos(prev => [...prev, ...newPhotos]);
      setSignedUrls(prev => {
        const updated = new Map(prev);
        newUrls.forEach((url, id) => updated.set(id, url));
        return updated;
      });
      
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
      setPhotos(prev => prev.filter(p => p.id !== photoId));
      setSignedUrls(prev => {
        const updated = new Map(prev);
        updated.delete(photoId);
        return updated;
      });
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
      setPhotos(prev => prev.map(p => ({
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
    getDisplayUrl,
    refreshPhotos: loadPhotos
  };
};
