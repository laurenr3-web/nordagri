
import { useState, useCallback } from 'react';
import { EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';

export function useEquipmentSelection() {
  const [selectedEquipment, setSelectedEquipment] = useState<Set<number>>(new Set());
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const toggleSelection = useCallback((equipmentId: number) => {
    setSelectedEquipment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(equipmentId)) {
        newSet.delete(equipmentId);
      } else {
        newSet.add(equipmentId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((equipment: EquipmentItem[]) => {
    setSelectedEquipment(new Set(equipment.map(item => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEquipment(new Set());
  }, []);

  const removeFromSelection = useCallback((equipmentId: number) => {
    setSelectedEquipment(prev => {
      const newSet = new Set(prev);
      newSet.delete(equipmentId);
      return newSet;
    });
  }, []);

  const getSelectedEquipment = useCallback((equipment: EquipmentItem[]) => {
    return equipment.filter(item => selectedEquipment.has(item.id));
  }, [selectedEquipment]);

  const openComparison = useCallback(() => {
    setIsComparisonOpen(true);
  }, []);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  return {
    selectedEquipment,
    isComparisonOpen,
    selectedCount: selectedEquipment.size,
    toggleSelection,
    selectAll,
    clearSelection,
    removeFromSelection,
    getSelectedEquipment,
    openComparison,
    closeComparison,
    hasSelection: selectedEquipment.size > 0,
    canCompare: selectedEquipment.size >= 2
  };
}
