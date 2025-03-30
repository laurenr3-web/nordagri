
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PartFormValues } from '../partFormTypes';

interface ImageFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [form.watch('image')]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://exemple.com/image.jpg" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {form.watch('image') && (
        <Card className="overflow-hidden">
          <CardContent className="p-2">
            <img 
              src={form.watch('image')} 
              alt="Aperçu de l'image"
              className="w-full h-auto object-contain max-h-[200px]"
              onError={() => setImageError(true)}
              style={{ display: imageError ? 'none' : 'block' }}
            />
            {imageError && (
              <div className="flex items-center justify-center h-[200px] bg-muted text-muted-foreground">
                URL d'image invalide ou inaccessible
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageField;
