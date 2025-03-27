
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { EquipmentFormValues } from './equipmentFormTypes';

interface NotesFieldProps {
  form: UseFormReturn<EquipmentFormValues>;
  label?: string;
  placeholder?: string;
  description?: string;
}

const NotesField: React.FC<NotesFieldProps> = ({ 
  form,
  label = "Notes",
  placeholder = "Entrez des informations supplémentaires sur cet équipement",
  description
}) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className="resize-none"
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default NotesField;
