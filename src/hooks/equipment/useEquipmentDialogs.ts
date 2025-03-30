
import { useState, useEffect } from 'react';
import { EquipmentItem } from './useEquipmentFilters';

export function useEquipmentDialogs() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);

  useEffect(() => {
    // Écouter les événements personnalisés pour ouvrir les dialogues
    const handleOpenAddDialog = () => {
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      setSelectedEquipment(event.detail);
    };

    // Ajouter les écouteurs d'événements
    window.addEventListener('open-add-equipment-dialog', handleOpenAddDialog);
    window.addEventListener('equipment-selected', 
      handleEquipmentSelected as EventListener);

    // Nettoyer les écouteurs d'événements à la destruction du composant
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
