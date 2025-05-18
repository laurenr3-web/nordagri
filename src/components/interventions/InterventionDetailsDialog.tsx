
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Intervention } from '@/types/Intervention';
import { DeleteInterventionAlert } from './dialogs/DeleteInterventionAlert';
import { useDeleteIntervention } from '@/hooks/interventions/useDeleteIntervention';
import { exportInterventionToPDF } from '@/utils/pdfExport';
import { toast } from 'sonner';
import InterventionDialogContent from './details/DialogContent';
import DialogFooterActions from './details/DialogFooterActions';

interface InterventionDetailsDialogProps {
  intervention: Intervention;
  isOpen: boolean;
  onClose: () => void;
  onStartWork: () => void;
  handleInterventionUpdate: (interventionId: number, updates: Partial<Intervention>) => void;
}

const InterventionDetailsDialog: React.FC<InterventionDetailsDialogProps> = ({ 
  intervention, 
  isOpen, 
  onClose, 
  onStartWork,
  handleInterventionUpdate
}) => {
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { deleteIntervention, isDeleting } = useDeleteIntervention();

  const handleDelete = () => {
    deleteIntervention(intervention.id, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const handleExportToPDF = async () => {
    try {
      await exportInterventionToPDF(intervention);
      toast.success("Rapport d'intervention exporté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export du PDF:", error);
      toast.error("Erreur lors de l'export du PDF");
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-between">
              <span>{intervention.title}</span>
            </DialogTitle>
          </DialogHeader>

          <InterventionDialogContent intervention={intervention} />

          <DialogFooter>
            <DialogFooterActions 
              intervention={intervention}
              onSetDeleteAlertOpen={setIsDeleteAlertOpen}
              onExportToPDF={handleExportToPDF}
              onStartWork={onStartWork}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <DeleteInterventionAlert
        open={isDeleteAlertOpen}
        onOpenChange={setIsDeleteAlertOpen}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default InterventionDetailsDialog;
