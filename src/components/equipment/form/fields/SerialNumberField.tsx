
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface SerialNumberFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
}

const SerialNumberField: React.FC<SerialNumberFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="serialNumber"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Serial Number</FormLabel>
          <FormControl>
            <Input placeholder="e.g., JD8R410-22-7834" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default SerialNumberField;
