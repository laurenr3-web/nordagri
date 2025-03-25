
import { Part } from '@/types/Part';
import { usePartsData } from './parts/usePartsData';
import { usePartsFilter, PartsView } from './parts/usePartsFilter';
import { useOrderParts } from './parts/useOrderParts';
import { usePartsDialogs } from './parts/usePartsDialogs';

// Main hook that composes all parts-related functionality
export const useParts = (initialParts: Part[] = []) => {
  // Import all the specialized hooks
  const partsData = usePartsData(initialParts);
  const partsFilter = usePartsFilter();
  const orderParts = useOrderParts();
  const partsDialogs = usePartsDialogs();

  // Get all unique categories from parts
  const categories = Array.from(
    new Set(['all', ...partsData.parts.map(part => part.category).filter(Boolean)])
  );
  
  // Get all unique manufacturers for filter
  const manufacturers = Array.from(
    new Set(partsData.parts.map(part => part.manufacturer).filter(Boolean))
  );

  // Apply filters to get filtered parts
  const filteredParts = partsFilter.filterParts(partsData.parts);
  
  // Function to clear all filters
  const clearFilters = () => {
    partsFilter.resetFilters();
  };

  // Function to handle submitting an order
  const handleOrderSubmit = () => {
    if (partsDialogs.selectedPart) {
      orderParts.handleOrderSubmit(partsDialogs.selectedPart);
    }
  };

  // Function to open part details
  const openPartDetails = (part: Part) => {
    partsDialogs.setSelectedPart(part);
    partsDialogs.setIsPartDetailsDialogOpen(true);
  };

  // Function to open order dialog
  const openOrderDialog = (part: Part) => {
    partsDialogs.setSelectedPart(part);
    partsDialogs.setIsOrderDialogOpen(true);
  };
  
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
    categories,
    manufacturers,
    
    // Filtered parts
    filteredParts,
    filterCount: partsFilter.getFilterCount(),
    clearFilters,
    
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
    handleOrderSubmit,
    openPartDetails,
    openOrderDialog
  };
};
