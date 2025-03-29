
import React, { useEffect } from 'react';
import AddEquipmentDialog from './AddEquipmentDialog';
import ViewEquipmentDialog from './ViewEquipmentDialog';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';

interface EquipmentDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  selectedEquipment: EquipmentItem | null;
  setSelectedEquipment: (equipment: EquipmentItem | null) => void;
}

const EquipmentDialogs: React.FC<EquipmentDialogsProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  selectedEquipment,
  setSelectedEquipment
}) => {
  console.log('EquipmentDialogs render state:', { 
    isAddDialogOpen, 
    hasSelectedEquipment: !!selectedEquipment 
  });

  // Debug dialog state changes
  useEffect(() => {
    console.log('EquipmentDialogs state updated:', {
      isAddDialogOpen,
      selectedEquipment: selectedEquipment ? selectedEquipment.name : 'none'
    });
  }, [isAddDialogOpen, selectedEquipment]);

  // Safe state updater function
  const safeSetIsAddDialogOpen = (open: boolean) => {
    console.log('Setting add dialog open state to:', open);
    setTimeout(() => {
      setIsAddDialogOpen(open);
    }, 50);
  };

  // Safe equipment selection function
  const safeSetSelectedEquipment = (equipment: EquipmentItem | null) => {
    console.log('Setting selected equipment to:', equipment ? equipment.name : 'null');
    setTimeout(() => {
      setSelectedEquipment(equipment);
    }, 50);
  };

  return (
    <>
      {/* Add Equipment Dialog */}
      <AddEquipmentDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={safeSetIsAddDialogOpen}
      />
      
      {/* View Equipment Dialog */}
      <ViewEquipmentDialog 
        equipment={selectedEquipment} 
        onClose={() => safeSetSelectedEquipment(null)}
      />
    </>
  );
};

export default EquipmentDialogs;
