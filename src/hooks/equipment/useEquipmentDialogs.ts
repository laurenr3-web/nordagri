
import { useState, useEffect } from 'react';
import { EquipmentItem } from '@/hooks/equipment/useEquipmentFilters';

/**
 * Hook to manage equipment dialog states
 */
export function useEquipmentDialogs() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    // Listen for custom events to open the dialogs
    const handleOpenAddDialog = () => {
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      setSelectedEquipment(event.detail);
    };

    window.addEventListener('open-add-equipment-dialog', handleOpenAddDialog);
    window.addEventListener('equipment-selected', 
      handleEquipmentSelected as EventListener);

    return () => {
      window.removeEventListener('open-add-equipment-dialog', handleOpenAddDialog);
      window.removeEventListener('equipment-selected', 
        handleEquipmentSelected as EventListener);
    };
  }, []);

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedEquipment,
    setSelectedEquipment
  };
}
