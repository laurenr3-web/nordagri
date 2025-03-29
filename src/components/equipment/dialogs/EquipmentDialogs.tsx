
import React, { useEffect, useRef } from 'react';
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
  // Use a ref to track if component is mounted
  const isMountedRef = useRef(true);
  
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
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMountedRef.current = false;
    };
  }, [isAddDialogOpen, selectedEquipment]);

  // Safe state updater functions
  const safeSetIsAddDialogOpen = (open: boolean) => {
    console.log('Setting add dialog open state to:', open);
    if (isMountedRef.current) {
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setIsAddDialogOpen(open);
        }
      });
    }
  };

  // Safe equipment selection function
  const safeSetSelectedEquipment = (equipment: EquipmentItem | null) => {
    console.log('Setting selected equipment to:', equipment ? equipment.name : 'null');
    if (isMountedRef.current) {
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          setSelectedEquipment(equipment);
        }
      });
    }
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
