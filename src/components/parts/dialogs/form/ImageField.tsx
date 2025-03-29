
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from './editPartFormTypes';
import ImageUrlInput from '@/components/equipment/form/fields/ImageUrlInput';
import ImagePreview from '@/components/equipment/form/fields/ImagePreview';
import PartPhotoCapture from '../../PartPhotoCapture';

interface ImageFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="image-url">URL de l'image</FormLabel>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <ImageUrlInput 
                value={field.value || ''}
                onChange={(value) => form.setValue('image', value)}
                id="image-url"
                placeholder="https://exemple.com/image.jpg"
                aria-describedby="image-description"
              />
            </div>
            
            {field.value ? (
              <ImagePreview 
                imageUrl={field.value}
                onReset={() => form.setValue('image', '')}
                altText="Aperçu de la pièce"
              />
            ) : (
              <PartPhotoCapture 
                onPhotoTaken={(imageDataUrl) => {
                  form.setValue('image', imageDataUrl);
                }}
              />
            )}
            
            <FormDescription id="image-description">
              Entrez une URL pour l'image de la pièce ou prenez une photo
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
