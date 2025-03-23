
import React from 'react';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { PartFormValues } from '../partFormTypes';
import CameraCapture from '@/components/equipment/form/CameraCapture';
import { FormControl } from '@/components/ui/form';
import ImagePreview from '@/components/equipment/form/fields/ImagePreview';

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
              <FormControl>
                <Input placeholder="https://example.com/image.jpg" {...field} />
              </FormControl>
              
              <CameraCapture 
                onCapture={(imageDataUrl) => {
                  form.setValue('image', imageDataUrl);
                }} 
              />
            </div>
            
            {/* Use the ImagePreview component instead of duplicating the code */}
            <ImagePreview 
              imageUrl={field.value} 
              onReset={() => form.setValue('image', '')}
            />
            
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
