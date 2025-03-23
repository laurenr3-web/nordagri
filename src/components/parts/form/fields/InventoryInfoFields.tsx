
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PartFormValues } from '../partFormTypes';

interface InventoryInfoFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

const InventoryInfoFields: React.FC<InventoryInfoFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price ($)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="99.99" {...field} />
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
            <FormLabel>Stock (units)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="10" {...field} />
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
            <FormLabel>Reorder Point</FormLabel>
            <FormControl>
              <Input type="number" placeholder="5" {...field} />
            </FormControl>
            <FormDescription>
              Minimum stock level before reordering
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Storage Location</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Warehouse A">Warehouse A</SelectItem>
                <SelectItem value="Warehouse B">Warehouse B</SelectItem>
                <SelectItem value="Service Center">Service Center</SelectItem>
                <SelectItem value="Mobile Unit">Mobile Unit</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default InventoryInfoFields;
