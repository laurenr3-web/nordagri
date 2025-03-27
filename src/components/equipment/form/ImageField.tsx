
import React from 'react';
import { FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
                <Input 
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

const Input: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  'aria-describedby'?: string;
}> = ({
  value,
  onChange,
  placeholder,
  id,
  'aria-describedby': ariaDescribedby
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      id={id}
      aria-describedby={ariaDescribedby}
    />
  );
};

export default ImageField;
