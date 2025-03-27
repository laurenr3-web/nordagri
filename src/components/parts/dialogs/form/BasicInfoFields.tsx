
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { PartFormValues } from './editPartFormTypes';

interface BasicInfoFieldsProps {
  form: UseFormReturn<PartFormValues>;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="part-name">Nom de la pièce</FormLabel>
            <FormControl>
              <Input id="part-name" placeholder="Entrez le nom" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="partNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="part-number">Numéro de pièce</FormLabel>
            <FormControl>
              <Input id="part-number" placeholder="Ex: AF-JD-4290" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="manufacturer">Fabricant</FormLabel>
            <FormControl>
              <Input id="manufacturer" placeholder="Ex: John Deere" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel htmlFor="category">Catégorie</FormLabel>
            <FormControl>
              <Input id="category" placeholder="Ex: filters" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoFields;
