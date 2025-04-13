
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
import { maintenanceService } from '@/services/supabase/maintenanceService';

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

  const handleSubmit = async (formData: Omit<MaintenancePlan, 'id' | 'active'>) => {
    try {
      setIsSubmitting(true);
      
      // Vérifier que nous avons un équipement valide
      if (!equipment) {
        toast.error("Aucun équipement sélectionné");
        return;
      }
      
      // Créer le plan de maintenance
      await createMaintenancePlan({
        ...formData,
        active: true
      });
      
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
