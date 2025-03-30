
import React, { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X } from 'lucide-react';
import { PartFormValues } from '../partFormTypes';
import CameraCapture from '@/components/equipment/form/CameraCapture';

interface ImageFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  const [imageError, setImageError] = useState(false);
  
  // Reset image error when URL changes
  React.useEffect(() => {
    setImageError(false);
  }, [form.watch('image')]);

  // Clear the current image
  const clearImage = () => {
    form.setValue('image', '');
    setImageError(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          form.setValue('image', event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = (imageDataUrl: string) => {
    form.setValue('image', imageDataUrl);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="image"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Part Image</FormLabel>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input 
                    placeholder="https://example.com/image.jpg" 
                    {...field} 
                  />
                </FormControl>
                
                <CameraCapture onCapture={handleCameraCapture} />
                
                <div className="relative">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    title="Upload image"
                  >
                    <Upload className="h-4 w-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleFileUpload}
                    />
                  </Button>
                </div>
              </div>
              
              {field.value && (
                <Card className="overflow-hidden">
                  <CardContent className="p-2 relative">
                    <img 
                      src={field.value} 
                      alt="Part preview"
                      className="w-full h-auto object-contain max-h-[200px]"
                      onError={() => setImageError(true)}
                      style={{ display: imageError ? 'none' : 'block' }}
                    />
                    {imageError && (
                      <div className="flex items-center justify-center h-[200px] bg-muted text-muted-foreground">
                        Invalid or inaccessible image URL
                      </div>
                    )}
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              <FormDescription>
                Enter a URL, upload an image, or take a photo with your camera
              </FormDescription>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ImageField;
