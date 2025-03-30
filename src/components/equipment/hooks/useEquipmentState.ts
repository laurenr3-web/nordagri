
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
      // Add required properties for EquipmentItem
      lastMaintenance: 'N/A', // Default value for lastMaintenance
      image: item.image || '',
      serialNumber: item.serialNumber || '',
      purchaseDate: item.purchaseDate 
        ? (typeof item.purchaseDate === 'object' 
           ? item.purchaseDate.toISOString() 
           : String(item.purchaseDate))
        : '',
      // Define default values for usage and nextService
      usage: { hours: 0, target: 500 }, 
      nextService: { type: 'Regular maintenance', due: 'In 30 days' }
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
