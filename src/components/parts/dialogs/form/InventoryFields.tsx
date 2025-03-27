
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from './editPartFormTypes';

interface InventoryFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

const InventoryFields: React.FC<InventoryFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="price">Prix</FormLabel>
            <FormControl>
              <Input id="price" placeholder="0.00" type="number" step="0.01" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="stock">Stock</FormLabel>
            <FormControl>
              <Input id="stock" placeholder="0" type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="location">Emplacement</FormLabel>
            <FormControl>
              <Input id="location" placeholder="Ex: Warehouse A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="reorderPoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="reorder-point">Point de réapprovisionnement</FormLabel>
            <FormControl>
              <Input id="reorder-point" placeholder="0" type="number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default InventoryFields;
