
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { PreviewImage } from './ObservationFormTypes';

interface PhotosUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export const PhotosUploader = ({ photos, onPhotosChange }: PhotosUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    
    const newImages: PreviewImage[] = [];
    const uploadedPhotoIds: string[] = [...photos];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      if (!file.type.startsWith('image/')) continue;
      
      // Générer un prévisualisation
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
      
      // Générer un ID unique pour le fichier
      const fileId = `${uuidv4()}.${file.name.split('.').pop()}`;
      
      try {
        // Upload vers Supabase Storage
        const { error } = await supabase.storage
          .from('field-observations')
          .upload(fileId, file);
          
        if (error) throw error;
        
        // Ajouter l'ID du fichier à la liste
        uploadedPhotoIds.push(fileId);
      } catch (error) {
        console.error("Erreur lors de l'upload:", error);
        toast.error("Erreur lors de l'upload de l'image");
      }
    }
    
    setPreviewImages([...previewImages, ...newImages]);
    onPhotosChange(uploadedPhotoIds);
    setIsUploading(false);
  };

  const removeImage = async (index: number) => {
    if (!photos) return;
    
    // Supprimer l'image du stockage
    try {
      const fileId = photos[index];
      await supabase.storage.from('field-observations').remove([fileId]);
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
    }
    
    // Supprimer la prévisualisation
    const newPreviewImages = [...previewImages];
    if (newPreviewImages[index]) {
      URL.revokeObjectURL(newPreviewImages[index].preview);
      newPreviewImages.splice(index, 1);
      setPreviewImages(newPreviewImages);
    }
    
    // Supprimer l'ID du fichier de la liste
    const newUploadedPhotoIds = [...photos];
    newUploadedPhotoIds.splice(index, 1);
    onPhotosChange(newUploadedPhotoIds);
  };

  const resetPhotos = () => {
    // Libérer les URL des prévisualisations
    previewImages.forEach(img => URL.revokeObjectURL(img.preview));
    setPreviewImages([]);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Photos</label>
      
      <div className="flex flex-wrap gap-2">
        {previewImages.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20">
            <img 
              src={img.preview} 
              className="w-20 h-20 object-cover rounded border"
              alt={`Preview ${idx}`} 
            />
            <button
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        
        <label className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
          <Camera className="h-6 w-6 text-gray-400" />
        </label>
      </div>
    </div>
  );
};
