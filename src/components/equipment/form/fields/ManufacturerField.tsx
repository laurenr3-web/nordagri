
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface ManufacturerFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
}

const ManufacturerField: React.FC<ManufacturerFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="manufacturer"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Manufacturer</FormLabel>
          <FormControl>
            <Input placeholder="e.g., John Deere" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ManufacturerField;
