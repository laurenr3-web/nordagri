
import React from 'react';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from '../partFormTypes';
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
          <FormLabel>Image</FormLabel>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <ImageUrlInput 
                value={field.value || ''}
                onChange={(value) => form.setValue('image', value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            
            {field.value ? (
              <ImagePreview 
                imageUrl={field.value}
                onReset={() => form.setValue('image', '')}
                altText="Part preview"
              />
            ) : (
              <PartPhotoCapture 
                onPhotoTaken={(imageDataUrl) => {
                  form.setValue('image', imageDataUrl);
                }}
              />
            )}
            
            <FormDescription>
              Enter a URL for the part image or take a photo
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
