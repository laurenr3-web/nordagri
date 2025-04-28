
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { PreviewImage } from './ObservationFormTypes';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ObservationFormValues } from './ObservationFormTypes';

interface PhotosUploaderProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const PhotosUploader = ({ form }: PhotosUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  
  // Récupérer la valeur courante des photos du formulaire
  const photos = form.watch('photos') || [];

  // Nettoyer les prévisualisations lorsque les photos changent
  useEffect(() => {
    return () => {
      previewImages.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    const newImages: PreviewImage[] = [];
    const uploadedPhotoIds: string[] = [...photos];
    const maxSizeMB = 5;
    const maxSizeBytes = maxSizeMB * 1024 * 1024; // 5MB en octets
    
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
          toast.error(`Le fichier "${file.name}" n'est pas une image`);
          continue;
        }
        
        // Vérifier la taille du fichier
        if (file.size > maxSizeBytes) {
          toast.error(`L'image "${file.name}" dépasse la taille maximale de ${maxSizeMB}MB`);
          continue;
        }
        
        // Générer une prévisualisation
        const preview = URL.createObjectURL(file);
        newImages.push({ file, preview });
        
        // Générer un ID unique pour le fichier
        const fileId = `${uuidv4()}.${file.name.split('.').pop()}`;
        
        // Upload vers Supabase Storage
        const { error } = await supabase.storage
          .from('field-observations')
          .upload(fileId, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Erreur lors de l'upload:", error);
          throw new Error(`Erreur lors de l'upload de l'image "${file.name}": ${error.message}`);
        }
        
        // Ajouter l'ID du fichier à la liste
        uploadedPhotoIds.push(fileId);
      }
      
      // Mettre à jour l'état local et le formulaire
      setPreviewImages([...previewImages, ...newImages]);
      form.setValue('photos', uploadedPhotoIds, {
        shouldDirty: true,
        shouldValidate: true
      });
      
      if (newImages.length > 0) {
        toast.success(`${newImages.length} photo${newImages.length > 1 ? 's' : ''} ajoutée${newImages.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      setUploadError(error instanceof Error ? error.message : "Erreur lors de l'upload des images");
      toast.error("Erreur lors de l'upload des images");
    } finally {
      setIsUploading(false);
      
      // Réinitialiser l'élément input pour permettre de choisir à nouveau le même fichier
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const removeImage = async (index: number) => {
    if (!photos || index >= photos.length) return;
    
    try {
      // Supprimer l'image du stockage
      const fileId = photos[index];
      const { error } = await supabase.storage
        .from('field-observations')
        .remove([fileId]);
      
      if (error) {
        throw new Error(`Erreur lors de la suppression de l'image: ${error.message}`);
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
      form.setValue('photos', newUploadedPhotoIds, {
        shouldDirty: true,
        shouldValidate: true 
      });
      
      toast.success("Photo supprimée avec succès");
    } catch (error) {
      console.error("Erreur lors de la suppression de l'image:", error);
      toast.error("Erreur lors de la suppression de l'image");
    }
  };

  return (
    <FormField
      control={form.control}
      name="photos"
      render={() => (
        <FormItem>
          <FormLabel>Photos</FormLabel>
          <FormControl>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 min-h-[80px]">
                {previewImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20">
                    <img 
                      src={img.preview} 
                      className="w-20 h-20 object-cover rounded border"
                      alt={`Aperçu ${idx + 1}`} 
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
                
                <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Camera className="h-6 w-6 text-gray-400" />
                  <span className="text-xs mt-1 text-gray-500">Ajouter</span>
                </label>
              </div>
              
              {isUploading && (
                <div className="text-sm text-blue-600">Téléchargement en cours...</div>
              )}
              
              {uploadError && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  {uploadError}
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
