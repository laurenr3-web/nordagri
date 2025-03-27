
import React from 'react';
import AddEquipmentDialog from './AddEquipmentDialog';
import ViewEquipmentDialog from './ViewEquipmentDialog';
import { useEquipmentDialogs } from '@/hooks/equipment/useEquipmentDialogs';

const EquipmentDialogs: React.FC = () => {
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedEquipment,
    setSelectedEquipment
  } = useEquipmentDialogs();

  return (
    <>
      {/* Add Equipment Dialog */}
      <AddEquipmentDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Equipment Details Dialog */}
      <ViewEquipmentDialog 
        equipment={selectedEquipment}
        onClose={() => setSelectedEquipment(null)}
      />
    </>
  );
};

export default EquipmentDialogs;
