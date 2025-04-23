import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import MaintenancePlanForm from '../forms/MaintenancePlanForm';
import { toast } from 'sonner';
import { useMaintenancePlanner, MaintenancePlan } from '@/hooks/maintenance/useMaintenancePlanner';

interface MaintenancePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: { id: number; name: string } | null;
}

const getTriggerInfo = (plan: MaintenancePlan, equipment?: any) => {
  if (!plan.trigger_unit || plan.trigger_unit === 'none') return null;

  const currentValue = plan.trigger_unit === 'hours' 
    ? equipment?.valeur_actuelle || 0
    : equipment?.kilometers || 0;

  const threshold = plan.trigger_unit === 'hours'
    ? plan.trigger_hours || 0
    : plan.trigger_kilometers || 0;

  const remaining = threshold - currentValue;
  const isOverdue = remaining <= 0;

  return {
    current: currentValue,
    threshold,
    remaining,
    isOverdue,
    unit: plan.trigger_unit === 'hours' ? 'h' : 'km'
  };
};

export default function MaintenancePlanDialog({ 
  isOpen, 
  onClose, 
  equipment 
}: MaintenancePlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMaintenancePlan } = useMaintenancePlanner();

  const handleSubmit = async (formData: Omit<MaintenancePlan, 'id' | 'active'>) => {
    try {
      setIsSubmitting(true);
      
      // Vérifier que nous avons un équipement valide
      if (!equipment) {
        toast.error("Aucun équipement sélectionné");
        return;
      }
      
      // Créer le plan de maintenance
      await createMaintenancePlan(formData);
      
      // Fermer la boîte de dialogue
      onClose();
      
      // Notification de succès
      toast.success("Plan de maintenance créé avec succès");
      
    } catch (error) {
      console.error("Erreur lors de la création du plan de maintenance:", error);
      toast.error("Impossible de créer le plan de maintenance");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Créer un plan de maintenance périodique</DialogTitle>
          <DialogDescription>
            Configurez un plan de maintenance récurrent pour {equipment?.name || "cet équipement"}
          </DialogDescription>
        </DialogHeader>
        
        <MaintenancePlanForm
          onSubmit={handleSubmit}
          equipment={equipment}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
