
import React from 'react';
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

  return (
    <>
      {/* Add Equipment Dialog */}
      <AddEquipmentDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
      
      {/* View Equipment Dialog */}
      <ViewEquipmentDialog 
        equipment={selectedEquipment} 
        onClose={() => setSelectedEquipment(null)}
      />
    </>
  );
};

export default EquipmentDialogs;
