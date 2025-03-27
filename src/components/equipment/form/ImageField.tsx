
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { EquipmentFormValues } from './equipmentFormTypes';
import CameraCapture from './CameraCapture';
import ImageUrlInput from './fields/ImageUrlInput';
import ImagePreview from './fields/ImagePreview';

interface ImageFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  description?: string;
}

const ImageField: React.FC<ImageFieldProps> = ({ 
  form,
  label = "Image",
  description = "Entrez une URL pour l'image de l'équipement ou prenez une photo"
}) => {
  return (
    <FormField
      control={form.control}
      name="image"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <FormControl>
                <ImageUrlInput 
                  value={field.value || ''}
                  onChange={(value) => form.setValue('image', value)}
                  placeholder="https://example.com/image.jpg"
                  id="equipment-image"
                  aria-describedby="equipment-image-description"
                />
              </FormControl>
              
              <CameraCapture 
                onCapture={(imageDataUrl) => {
                  form.setValue('image', imageDataUrl);
                }} 
              />
            </div>
            
            <ImagePreview 
              imageUrl={field.value}
              onReset={() => form.setValue('image', '')} 
            />
            
            <FormDescription id="equipment-image-description">
              {description}
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
