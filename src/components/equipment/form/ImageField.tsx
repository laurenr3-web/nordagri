
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import CameraCapture from './CameraCapture';
import { EquipmentFormValues } from './equipmentFormTypes';

interface ImageFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
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
                <Input placeholder="Enter image URL" {...field} />
              </FormControl>
              
              <CameraCapture 
                onCapture={(imageDataUrl) => {
                  form.setValue('image', imageDataUrl);
                }} 
              />
            </div>
            
            {/* Image preview */}
            {field.value && (
              <div className="mt-2 relative bg-muted rounded-md overflow-hidden w-full">
                <div className="aspect-square w-full max-w-xs mx-auto">
                  <img
                    src={field.value}
                    alt="Equipment preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            )}
            
            <FormDescription>
              Enter a URL for the equipment image or take a photo
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
