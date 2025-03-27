
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
          <FormLabel>Équipements compatibles (séparés par des virgules)</FormLabel>
          <FormControl>
            <Textarea className="min-h-[80px]" {...field} />
          </FormControl>
          <FormDescription>
            Listez les modèles d'équipement séparés par des virgules
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompatibilityField;
