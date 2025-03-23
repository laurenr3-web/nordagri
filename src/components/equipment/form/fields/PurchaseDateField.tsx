
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { EquipmentFormValues } from '../equipmentFormTypes';

interface PurchaseDateFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
}

const PurchaseDateField: React.FC<PurchaseDateFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="purchaseDate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Purchase Date</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PurchaseDateField;
