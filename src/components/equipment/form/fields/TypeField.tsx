
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface TypeFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
}

const TypeField: React.FC<TypeFieldProps> = ({ 
  form,
  label = "Type",
  placeholder = "Select type"
}) => {
  return (
    <FormField
      control={form.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="Tractor">Tractor</SelectItem>
              <SelectItem value="Harvester">Harvester</SelectItem>
              <SelectItem value="Truck">Truck</SelectItem>
              <SelectItem value="Implement">Implement</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TypeField;
