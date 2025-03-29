
import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';
import { useEquipmentUpdate } from '@/hooks/equipment/useEquipmentUpdate';
import { toast } from 'sonner';

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
  const [isClosing, setIsClosing] = useState(false);
  
  // Track when component will unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleEquipmentUpdate = async (updatedEquipment: any) => {
    try {
      if (!isMountedRef.current) return;
      
      const result = await updateEquipment(updatedEquipment);
      
      // Si la mise à jour réussit, fermer le dialogue après un court délai
      if (result && isMountedRef.current) {
        toast.success("Équipement mis à jour avec succès");
        setIsClosing(true);
        
        // Mieux gérer la fermeture du dialogue
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 300);
      }
    } catch (error) {
      console.error('Failed to update equipment:', error);
      toast.error("Échec de la mise à jour de l'équipement");
      // L'erreur est déjà gérée dans le hook
    }
  };

  // Gestion plus sécurisée des changements d'état du dialogue
  const handleOpenChange = (open: boolean) => {
    if (!open && !isClosing && isMountedRef.current) {
      setIsClosing(true);
      
      // Utiliser requestAnimationFrame pour une meilleure synchronisation
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (isMountedRef.current) {
            onClose();
          }
        }, 300);
      });
    }
  };

  return (
    <Dialog 
      open={!!equipment && !isClosing} 
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
