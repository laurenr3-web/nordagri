
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface SerialNumberFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
}

const SerialNumberField: React.FC<SerialNumberFieldProps> = ({ 
  form,
  label = "Numéro de série",
  placeholder = "ex: JD8R410-22-7834" 
}) => {
  return (
    <FormField
      control={form.control}
      name="serialNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input 
              placeholder={placeholder} 
              {...field} 
              value={field.value || ''} 
              onChange={(e) => {
                // Handle empty string correctly
                const value = e.target.value.trim() === '' ? null : e.target.value;
                field.onChange(value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SerialNumberField;
