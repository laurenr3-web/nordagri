
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';
import { exportInterventionToPDF } from '@/utils/pdfExport';

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
      notes: intervention ? `Intervention ${intervention.title} réalisée sur l'équipement ${intervention.equipment}.` : '',
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
      // Convert form part format to intervention part format
      partsUsed: (values.partsUsed || []).map(part => ({
        partId: part.id,
        name: part.name,
        quantity: part.quantity
      }))
    };

    // Call the onSubmit callback with the updated intervention
    onSubmit(updatedIntervention, values);
    onOpenChange(false);
  };

  // Function to export report to PDF
  const handleExportToPDF = async () => {
    if (!intervention) return;
    
    try {
      const formValues = form.getValues();
      await exportInterventionToPDF(intervention, {
        reportNotes: formValues.notes,
        actualDuration: formValues.duration
      });
      toast.success("Rapport d'intervention exporté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export du PDF:", error);
      toast.error("Une erreur s'est produite lors de l'export du rapport");
    }
  };

  // Add part to the form
  const addPart = (part: { id: number; name: string }) => {
    const currentParts = form.getValues('partsUsed') || [];
    const existingPartIndex = currentParts.findIndex(p => p.id === part.id);
    
    if (existingPartIndex >= 0) {
      // Increment quantity if part already exists
      const updatedParts = [...currentParts];
      updatedParts[existingPartIndex].quantity += 1;
      form.setValue('partsUsed', updatedParts);
    } else {
      // Add new part with quantity 1
      form.setValue('partsUsed', [...currentParts, { id: part.id, name: part.name, quantity: 1 }]);
    }
  };

  // Remove part from form
  const removePart = (partId: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    form.setValue(
      'partsUsed',
      currentParts.filter(p => p.id !== partId)
    );
  };

  // Update part quantity
  const updatePartQuantity = (partId: number, quantity: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    const updatedParts = currentParts.map(part => 
      part.id === partId ? { ...part, quantity } : part
    );
    form.setValue('partsUsed', updatedParts);
  };

  return {
    form,
    handleSubmit,
    handleExportToPDF,
    pdfReady,
    addPart,
    removePart,
    updatePartQuantity
  };
};
