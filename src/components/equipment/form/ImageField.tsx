
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import ImageUrlInput from './fields/ImageUrlInput';
import ImagePreview from './fields/ImagePreview';
import CameraCapture from './CameraCapture';

interface ImageFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Synchroniser la valeur du formulaire avec la prévisualisation
  useEffect(() => {
    const imageValue = form.watch('image');
    setPreviewUrl(imageValue || '');
  }, [form.watch('image')]);

  // Gestionnaire pour la capture de caméra
  const handleCameraCapture = (imageDataUrl: string) => {
    form.setValue('image', imageDataUrl);
    setPreviewUrl(imageDataUrl);
  };

  // Réinitialiser l'image
  const handleImageReset = () => {
    form.setValue('image', '');
    setPreviewUrl('');
  };

  // Forcer la mise à jour de la prévisualisation après modification manuelle de l'URL
  const handleImageUrlBlur = () => {
    const imageValue = form.getValues('image');
    setPreviewUrl(imageValue || '');
  };

  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Image de l'équipement</FormLabel>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FormControl>
                <ImageUrlInput
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="URL de l'image ou utilisez la caméra"
                  onBlur={handleImageUrlBlur}
                />
              </FormControl>
              <CameraCapture onCapture={handleCameraCapture} />
            </div>
            <ImagePreview 
              imageUrl={previewUrl} 
              onReset={handleImageReset}
              altText="Aperçu de l'équipement" 
            />
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
