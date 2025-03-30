
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PartFormValues } from '../partFormTypes';

interface InventoryFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

const InventoryFields: React.FC<InventoryFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prix (€)</FormLabel>
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
            <FormLabel>Stock (unités)</FormLabel>
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
            <FormLabel>Seuil d'alerte</FormLabel>
            <FormControl>
              <Input type="number" placeholder="5" {...field} />
            </FormControl>
            <FormDescription>
              Quantité minimale avant réapprovisionnement
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
            <FormLabel>Emplacement</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un emplacement" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Entrepôt A">Entrepôt A</SelectItem>
                <SelectItem value="Entrepôt B">Entrepôt B</SelectItem>
                <SelectItem value="Atelier">Atelier</SelectItem>
                <SelectItem value="Unité mobile">Unité mobile</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default InventoryFields;
