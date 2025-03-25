
import { Part } from '@/types/Part';
import { usePartsData } from './parts/usePartsData';
import { usePartsFilter } from './parts/usePartsFilter';
import { useOrderParts } from './parts/useOrderParts';
import { usePartsDialogs } from './parts/usePartsDialogs';
import { usePartsCategories } from './parts/usePartsCategories';
import { usePartsActions } from './parts/usePartsActions';

// Main hook that composes all parts-related functionality
export const useParts = (initialParts: Part[] = []) => {
  // Import all the specialized hooks
  const partsData = usePartsData(initialParts);
  const partsFilter = usePartsFilter();
  const orderParts = useOrderParts();
  const partsDialogs = usePartsDialogs();
  const partsCategories = usePartsCategories(partsData.parts);
  const partsActions = usePartsActions(partsDialogs, orderParts);
  
  // Apply filters to get filtered parts
  const filteredParts = partsFilter.filterParts(partsData.parts);
  
  return {
    // Parts data
    parts: partsData.parts,
    isLoading: partsData.isLoading,
    isError: partsData.isError,
    
    // UI state
    currentView: partsFilter.currentView,
    setCurrentView: partsFilter.setCurrentView,
    
    // Search and filters
    searchTerm: partsFilter.searchTerm,
    setSearchTerm: partsFilter.setSearchTerm,
    selectedCategory: partsFilter.selectedCategory,
    setSelectedCategory: partsFilter.setSelectedCategory,
    
    // Categories and manufacturers lists
    categories: partsCategories.categories,
    manufacturers: partsCategories.manufacturers,
    
    // Filtered parts
    filteredParts,
    filterCount: partsFilter.getFilterCount(),
    clearFilters: partsFilter.resetFilters,
    
    // Filter state
    filterManufacturers: partsFilter.filterManufacturers,
    toggleManufacturerFilter: partsFilter.toggleManufacturerFilter,
    filterMinPrice: partsFilter.filterMinPrice,
    setFilterMinPrice: partsFilter.setFilterMinPrice,
    filterMaxPrice: partsFilter.filterMaxPrice,
    setFilterMaxPrice: partsFilter.setFilterMaxPrice,
    filterInStock: partsFilter.filterInStock,
    setFilterInStock: partsFilter.setFilterInStock,
    sortBy: partsFilter.sortBy,
    setSortBy: partsFilter.setSortBy,
    
    // Dialog states
    ...partsDialogs,
    
    // Order states
    ...orderParts,
    
    // Actions
    handleAddPart: partsData.handleAddPart,
    handleUpdatePart: partsData.handleUpdatePart,
    handleDeletePart: partsData.handleDeletePart,
    handleOrderSubmit: partsActions.handleOrderSubmit,
    openPartDetails: partsActions.openPartDetails,
    openOrderDialog: partsActions.openOrderDialog
  };
};
