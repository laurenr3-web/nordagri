
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { PartFormValues } from '../partFormTypes';

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
          <FormLabel>Compatibilité</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Séparez les modèles compatibles par des virgules (JD6920, NH T7.210, etc.)" 
              className="h-20 resize-none"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            Indiquez les modèles d'équipement compatibles avec cette pièce
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompatibilityField;
