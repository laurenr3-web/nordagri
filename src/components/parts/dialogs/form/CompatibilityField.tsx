
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
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
      render={({ field }) => {
        // Convert number[] to string for display in the input
        const displayValue = Array.isArray(field.value) 
          ? field.value.join(', ')
          : '';

        // Handle changes - convert comma-separated string to number[]
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const inputValue = e.target.value;
          const numericValues = inputValue
            .split(',')
            .map(item => parseInt(item.trim()))
            .filter(id => !isNaN(id));
          
          form.setValue('compatibility', numericValues);
        };
        
        return (
          <FormItem>
            <FormLabel htmlFor="compatibility">Équipements compatibles (IDs)</FormLabel>
            <FormControl>
              <Input 
                id="compatibility"
                className="text-yellow-600" 
                placeholder="IDs des équipements séparés par des virgules (1, 2, 3, etc.)"
                aria-describedby="compatibility-description"
                value={displayValue}
                onChange={handleChange}
              />
            </FormControl>
            <FormDescription id="compatibility-description" className="text-amber-600">
              Ce champ est obsolète. Utilisez plutôt le sélecteur d'équipements compatibles.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default CompatibilityField;
