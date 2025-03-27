
import { useState, useMemo } from 'react';
import { useEquipmentFilters, EquipmentItem } from '@/components/equipment/hooks/useEquipmentFilters';
import { Equipment } from '@/services/supabase/equipmentService';

export const useEquipmentState = (equipment: Equipment[] | null) => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Transform the equipment data to include UI-specific properties
  const transformedEquipment: EquipmentItem[] = useMemo(() => {
    if (!equipment) return [];
    
    return equipment.map((item: Equipment) => ({
      id: item.id,
      name: item.name,
      type: item.type || 'Unknown',
      category: item.category || 'Uncategorized',
      manufacturer: item.manufacturer || '',
      model: item.model || '',
      year: item.year || 0,
      status: item.status || 'unknown',
      location: item.location || '',
      lastMaintenance: item.lastMaintenance ? item.lastMaintenance.toString() : 'N/A',
      image: item.image || '',
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate ? item.purchaseDate.toString() : '',
      usage: item.usage || { hours: 0, target: 500 }, // Default values
      nextService: item.nextService || { type: 'Regular maintenance', due: 'In 30 days' } // Default values
    }));
  }, [equipment]);

  const {
    searchTerm,
    setSearchTerm,
    currentView,
    setCurrentView,
    selectedCategory,
    setSelectedCategory,
    filters,
    statusOptions,
    typeOptions,
    manufacturerOptions,
    yearOptions,
    toggleFilter,
    isFilterActive,
    clearFilters,
    resetAllFilters,
    activeFilterCount,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filteredEquipment
  } = useEquipmentFilters(transformedEquipment);

  const handleEquipmentClick = (equipment: EquipmentItem) => {
    setSelectedEquipment(equipment);
  };

  return {
    transformedEquipment,
    selectedEquipment,
    setSelectedEquipment,
    isAddDialogOpen,
    setIsAddDialogOpen,
    filterState: {
      searchTerm,
      setSearchTerm,
      currentView,
      setCurrentView,
      selectedCategory,
      setSelectedCategory,
      filters,
      statusOptions,
      typeOptions,
      manufacturerOptions,
      yearOptions,
      toggleFilter,
      isFilterActive,
      clearFilters,
      resetAllFilters,
      activeFilterCount,
      sortBy,
      setSortBy,
      sortOrder,
      setSortOrder,
      filteredEquipment
    },
    viewState: {
      currentView,
      setCurrentView
    },
    handleEquipmentClick
  };
};
