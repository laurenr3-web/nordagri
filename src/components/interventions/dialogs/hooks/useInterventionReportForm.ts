
import { useState } from 'react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from 'sonner';
import { Intervention } from '@/types/Intervention';
import { exportInterventionToPDF } from '@/utils/pdfExport';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  duration: z.coerce
    .number()
    .min(0.1, {
      message: "La durée doit être supérieure à 0",
    }),
  notes: z.string().min(1, {
    message: "Veuillez fournir un compte-rendu de l'intervention",
  }),
  partsUsed: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1),
    })
  ).optional(),
});

export type InterventionReportFormValues = z.infer<typeof formSchema>;

interface UseInterventionReportFormProps {
  intervention: Intervention | null;
  onSubmit: (intervention: Intervention, report: InterventionReportFormValues) => void;
  onOpenChange: (open: boolean) => void;
}

export const useInterventionReportForm = ({ 
  intervention, 
  onSubmit, 
  onOpenChange 
}: UseInterventionReportFormProps) => {
  // Valeurs par défaut
  const defaultValues: Partial<InterventionReportFormValues> = {
    duration: intervention?.scheduledDuration || 1,
    notes: `Intervention ${intervention?.title} réalisée sur l'équipement ${intervention?.equipment}.`,
    partsUsed: intervention?.partsUsed || [],
  };

  // Form hooks
  const form = useForm<InterventionReportFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Soumettre le formulaire
  const handleSubmit = (values: InterventionReportFormValues) => {
    if (intervention) {
      onSubmit(intervention, values);
      onOpenChange(false);
    }
  };

  // Ajouter une pièce utilisée
  const addPart = (part: { id: number; name: string; }) => {
    const currentParts = form.getValues('partsUsed') || [];
    const existingPartIndex = currentParts.findIndex(p => p.id === part.id);
    
    if (existingPartIndex >= 0) {
      // Incrémenter la quantité si la pièce existe déjà
      const updatedParts = [...currentParts];
      updatedParts[existingPartIndex].quantity += 1;
      form.setValue('partsUsed', updatedParts);
    } else {
      // Ajouter une nouvelle pièce avec quantité 1
      form.setValue('partsUsed', [...currentParts, { ...part, quantity: 1 }]);
    }
  };

  // Retirer une pièce
  const removePart = (partId: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    form.setValue(
      'partsUsed',
      currentParts.filter(p => p.id !== partId)
    );
  };

  // Mettre à jour la quantité d'une pièce
  const updatePartQuantity = (partId: number, quantity: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    const updatedParts = currentParts.map(part => 
      part.id === partId ? { ...part, quantity } : part
    );
    form.setValue('partsUsed', updatedParts);
  };
  
  const handleExportToPDF = async () => {
    try {
      if (intervention) {
        const values = form.getValues();
        await exportInterventionToPDF(
          intervention,
          {
            reportNotes: values.notes,
            actualDuration: values.duration
          }
        );
        toast.success("Rapport d'intervention exporté en PDF");
      }
    } catch (error) {
      console.error("Erreur lors de l'export du PDF:", error);
      toast.error("Erreur lors de l'export du PDF");
    }
  };

  return {
    form,
    handleSubmit,
    addPart,
    removePart,
    updatePartQuantity,
    handleExportToPDF,
  };
};
