
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from './editPartFormTypes';

interface CompatibilityFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const CompatibilityField: React.FC<CompatibilityFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="compatibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor="compatibility">Équipements compatibles</FormLabel>
          <FormControl>
            <Textarea 
              id="compatibility"
              className="min-h-[80px]" 
              placeholder="Exemple: John Deere 8R 410, John Deere 7R Series"
              aria-describedby="compatibility-description"
              {...field} 
            />
          </FormControl>
          <FormDescription id="compatibility-description">
            Listez les modèles d'équipement séparés par des virgules
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompatibilityField;
