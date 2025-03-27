
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface ManufacturerFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
}

const ManufacturerField: React.FC<ManufacturerFieldProps> = ({ 
  form,
  label = "Manufacturer",
  placeholder = "e.g., John Deere" 
}) => {
  return (
    <FormField
      control={form.control}
      name="manufacturer"
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

export default ManufacturerField;
