
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface YearFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
}

const YearField: React.FC<YearFieldProps> = ({ 
  form,
  label = "Year",
  placeholder = "e.g., 2023" 
}) => {
  return (
    <FormField
      control={form.control}
      name="year"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default YearField;
