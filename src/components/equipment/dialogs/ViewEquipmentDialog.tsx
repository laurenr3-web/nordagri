
import React, { useEffect, useRef } from 'react';
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
  const isMountedRef = useRef(true);
  
  // Track when component will unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      const result = await updateEquipment(updatedEquipment);
      
      // If the update is successful, close the dialog after a short delay
      if (result && isMountedRef.current) {
        // Use requestAnimationFrame for better timing with browser rendering cycle
        requestAnimationFrame(() => {
          if (isMountedRef.current) {
            setTimeout(() => {
              if (isMountedRef.current) {
                onClose();
              }
            }, 100);
          }
        });
      }
    } catch (error) {
      console.error('Failed to update equipment:', error);
      // Error is already handled in the hook
    }
  };

  // Safely handle dialog open state changes
  const handleOpenChange = (open: boolean) => {
    console.log('Equipment dialog open state changed to:', open);
    if (!open && isMountedRef.current) {
      // Use requestAnimationFrame for smoother state transitions
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          // Add additional delay to ensure animation completes
          setTimeout(() => {
            if (isMountedRef.current) {
              onClose();
            }
          }, 100);
        }
      });
    }
  };

  return (
    <Dialog 
      open={!!equipment} 
      onOpenChange={handleOpenChange}
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
