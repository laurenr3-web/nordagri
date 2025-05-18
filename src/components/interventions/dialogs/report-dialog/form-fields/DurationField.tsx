
import React from 'react';
import { Control } from "react-hook-form";
import { Clock } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InterventionReportFormValues } from '../../hooks/useInterventionReportForm';

interface DurationFieldProps {
  control: Control<InterventionReportFormValues>;
}

export const DurationField: React.FC<DurationFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="duration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Durée réelle (heures)</FormLabel>
          <FormControl>
            <div className="flex items-center">
              <Input 
                type="number" 
                min="0.1" 
                step="0.1"
                {...field} 
              />
              <Clock className="w-4 h-4 text-muted-foreground ml-2" />
            </div>
          </FormControl>
          <FormDescription>
            Durée effective de l'intervention
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
