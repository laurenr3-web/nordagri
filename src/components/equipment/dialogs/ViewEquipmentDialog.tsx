
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
import { useEquipmentUpdate } from '@/hooks/equipment/useEquipmentUpdate';

interface ViewEquipmentDialogProps {
  equipment: EquipmentItem | null;
  onClose: () => void;
}

const ViewEquipmentDialog: React.FC<ViewEquipmentDialogProps> = ({ 
  equipment, 
  onClose 
}) => {
  const { updateEquipment } = useEquipmentUpdate();

  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      const result = await updateEquipment(updatedEquipment);
      
      // If the update is successful, close the dialog after a short delay
      if (result) {
        setTimeout(() => onClose(), 500);
      }
    } catch (error) {
      console.error('Failed to update equipment:', error);
      // Error is already handled in the hook
    }
  };

  return (
    <Dialog 
      open={!!equipment} 
      onOpenChange={(open) => {
        console.log('Equipment dialog open state changed to:', open);
        if (!open) {
          // Use setTimeout to prevent the DOM manipulation error
          setTimeout(() => onClose(), 10);
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de l'équipement</DialogTitle>
        </DialogHeader>
        {equipment && (
          <EquipmentDetails 
            equipment={equipment} 
            onUpdate={handleEquipmentUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewEquipmentDialog;
