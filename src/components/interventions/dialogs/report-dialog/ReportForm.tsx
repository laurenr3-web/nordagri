
import React from 'react';
import { UseFormReturn } from "react-hook-form";
import { Form } from '@/components/ui/form';
import { InterventionReportFormValues } from '../hooks/useInterventionReportForm';
import { DurationField } from './form-fields/DurationField';
import { PartsUsedField } from './form-fields/PartsUsedField';
import { NotesField } from './form-fields/NotesField';

interface ReportFormProps {
  form: UseFormReturn<InterventionReportFormValues>;
  availableParts: Array<{ id: number; name: string; quantity: number; }>;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  form,
  availableParts
}) => {
  return (
    <Form {...form}>
      <form className="space-y-4">
        <DurationField control={form.control} />
        
        <PartsUsedField 
          control={form.control}
          availableParts={availableParts} 
          watch={form.watch}
          getValues={form.getValues}
          setValue={form.setValue}
        />
        
        <NotesField control={form.control} />
      </form>
    </Form>
  );
};
