
import React from 'react';
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { InterventionReportFormValues } from '../../hooks/useInterventionReportForm';

interface NotesFieldProps {
  control: Control<InterventionReportFormValues>;
}

export const NotesField: React.FC<NotesFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Compte-rendu</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Décrivez les travaux effectués et observations"
              rows={6}
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
