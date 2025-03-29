
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from './editPartFormTypes';
import ImageUrlInput from '@/components/equipment/form/fields/ImageUrlInput';
import ImagePreview from '@/components/equipment/form/fields/ImagePreview';
import PartPhotoCapture from '../../PartPhotoCapture';
import { usePartVisionIdentification } from '@/hooks/parts/usePartVisionIdentification';
import { toast } from 'sonner';

interface ImageFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const ImageField: React.FC<ImageFieldProps> = ({ form }) => {
  const { identifyPart, isIdentifying } = usePartVisionIdentification();

  const handleIdentifyPart = async (imageDataUrl: string) => {
    const result = await identifyPart(imageDataUrl);
    
    if (result) {
      // Auto-remplir les champs du formulaire avec les données identifiées
      if (result.probableName) {
        form.setValue('name', result.probableName, { shouldValidate: true });
      }
      
      if (result.manufacturer) {
        form.setValue('manufacturer', result.manufacturer, { shouldValidate: true });
      }
      
      if (result.referenceNumber) {
        form.setValue('partNumber', result.referenceNumber, { shouldValidate: true });
      }
      
      if (result.type) {
        form.setValue('category', result.type.toLowerCase(), { shouldValidate: true });
      }
      
      if (result.possibleUses && result.possibleUses.length > 0) {
        // Convertir le tableau en chaîne pour le champ de compatibilité
        form.setValue('compatibility', result.possibleUses.join(', '), { shouldValidate: true });
      }
      
      toast.success("Champs auto-remplis", {
        description: "Les données identifiées ont été utilisées pour remplir le formulaire"
      });
    }
  };
  
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
                onIdentifyPhoto={handleIdentifyPart}
                identificationInProgress={isIdentifying}
              />
            )}
            
            <FormDescription id="image-description">
              Entrez une URL pour l'image de la pièce ou prenez une photo. L'IA tentera d'identifier la pièce à partir de la photo.
            </FormDescription>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default ImageField;
