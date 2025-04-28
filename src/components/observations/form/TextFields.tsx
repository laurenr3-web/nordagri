
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ObservationFormValues } from './ObservationFormTypes';

interface LocationInputProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const LocationInput = ({ form }: LocationInputProps) => (
  <FormField
    control={form.control}
    name="location"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Localisation</FormLabel>
        <FormControl>
          <Input 
            placeholder="Localisation (optionnel)" 
            {...field}
            value={field.value || ''}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

interface DescriptionTextareaProps {
  form: UseFormReturn<ObservationFormValues>;
}

export const DescriptionTextarea = ({ form }: DescriptionTextareaProps) => (
  <FormField
    control={form.control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Description</FormLabel>
        <FormControl>
          <Textarea
            placeholder="Description détaillée (optionnel)"
            className="min-h-[100px]"
            {...field}
            value={field.value || ''}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);
