
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { PartFormValues } from '../partFormTypes';

interface CompatibilityFieldProps {
  form: UseFormReturn<PartFormValues>;
}

const CompatibilityField: React.FC<CompatibilityFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="compatibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipment Compatibility</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="John Deere 8R 410, John Deere 7R Series"
              className="min-h-[80px]"
              {...field} 
            />
          </FormControl>
          <FormDescription>
            List equipment models separated by commas
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CompatibilityField;
