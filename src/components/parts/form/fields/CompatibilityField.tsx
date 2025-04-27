
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { PartFormValues } from '../partFormTypes';

interface CompatibilityFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const CompatibilityField: React.FC<CompatibilityFieldProps> = ({ form }) => {
  // Pour ce champ, nous affichons simplement un message indiquant qu'il est obsolète
  // et que l'utilisateur devrait utiliser CompatibilityMultiSelectField à la place

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
            <FormLabel>Compatibilité (IDs des équipements)</FormLabel>
            <FormControl>
              <Input 
                placeholder="IDs des équipements séparés par des virgules (1, 2, 3, etc.)" 
                value={displayValue}
                onChange={handleChange}
                className="text-yellow-600"
              />
            </FormControl>
            <FormDescription className="text-amber-600">
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
