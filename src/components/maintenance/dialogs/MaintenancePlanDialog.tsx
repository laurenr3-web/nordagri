
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useMaintenancePlanner } from '@/hooks/maintenance/useMaintenancePlanner';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import MaintenancePlanForm from '@/hooks/maintenance/forms/MaintenancePlanForm';

interface MaintenancePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: { id: number; name: string } | null;
}

export default function MaintenancePlanDialog({ 
  isOpen, 
  onClose, 
  equipment 
}: MaintenancePlanDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createMaintenancePlan } = useMaintenancePlanner();

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      // Vérifier que nous avons un équipement valide
      if (!equipment) {
        toast.error("Aucun équipement sélectionné");
        return;
      }

      // Add the equipment ID and active status
      const planData = {
        ...formData,
        equipment_id: equipment.id,
        active: true
      };
      
      // Créer le plan de maintenance
      await createMaintenancePlan(planData);
      
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
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
