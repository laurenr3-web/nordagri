
import { useState, useEffect } from 'react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

export function useEquipmentDialogs() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    // Listen for custom events to open the dialogs
    const handleOpenAddDialog = () => {
      console.log('Opening add equipment dialog');
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      console.log('Equipment selected event received:', event.detail);
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
