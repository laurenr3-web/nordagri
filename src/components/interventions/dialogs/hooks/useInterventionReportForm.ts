
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Intervention } from '@/types/Intervention';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InterventionReportPDF from '../../reports/InterventionReportPDF';

// Define a schema for the form values
const reportFormSchema = z.object({
  duration: z.number().optional(),
  notes: z.string().optional(),
  partsUsed: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1, "La quantité doit être d'au moins 1")
    })
  ).optional()
});

// Export the type for form values
export type InterventionReportFormValues = z.infer<typeof reportFormSchema>;

interface UseInterventionReportFormProps {
  intervention: Intervention | null;
  onSubmit: (intervention: Intervention, report: any) => void;
  onOpenChange: (open: boolean) => void;
}

export const useInterventionReportForm = ({ intervention, onSubmit, onOpenChange }: UseInterventionReportFormProps) => {
  const [pdfReady, setPdfReady] = useState(false);

  // Initialize form with default values
  const form = useForm<InterventionReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      duration: intervention?.duration || 0,
      notes: '',
      partsUsed: []
    }
  });

  // Function to handle form submission
  const handleSubmit = (values: InterventionReportFormValues) => {
    if (!intervention) return;

    // Create updated intervention with report data
    const updatedIntervention = {
      ...intervention,
      duration: values.duration || intervention.duration,
      notes: values.notes || '',
      partsUsed: values.partsUsed || []
    };

    // Call the onSubmit callback with the updated intervention
    onSubmit(updatedIntervention, values);
    onOpenChange(false);
  };

  // Function to export report to PDF
  const handleExportToPDF = () => {
    setPdfReady(true);
  };

  return {
    form,
    handleSubmit,
    handleExportToPDF,
    pdfReady
  };
};
