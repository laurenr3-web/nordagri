
import { Part } from '@/types/Part';
import { usePartsData } from './parts/usePartsData';
import { usePartsFilter } from './parts/usePartsFilter';
import { useOrderParts } from './parts/useOrderParts';
import { usePartsDialogs } from './parts/usePartsDialogs';
import { usePartsCategories } from './parts/usePartsCategories';
import { usePartsActions } from './parts/usePartsActions';
import { useCreatePart, useUpdatePart, useDeletePart } from './usePartsMutations';

// Main hook that composes all parts-related functionality
export const useParts = () => {
  // Import all the specialized hooks
  const partsQuery = usePartsData();
  const partsFilter = usePartsFilter();
  const orderParts = useOrderParts();
  const partsDialogs = usePartsDialogs();
  
  // Get the parts data from the query result
  const data = partsQuery.data || [];
  
  const partsCategories = usePartsCategories(data);
  const partsActions = usePartsActions(partsDialogs, orderParts);
  
  // Get mutation hooks
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();
  
  // Apply filters to get filtered parts
  const filteredParts = partsFilter.filterParts(data);
  
  // Part mutation handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    return createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    return updatePartMutation.mutate(part);
  };
  
  const handleDeletePart = (partId: number | string) => {
    return deletePartMutation.mutate(partId);
  };
  
  return {
    // Parts data
    parts: data,
    isLoading: partsQuery.isLoading,
    isError: partsQuery.isError,
    
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
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
    handleOrderSubmit: partsActions.handleOrderSubmit,
    openPartDetails: partsActions.openPartDetails,
    openOrderDialog: partsActions.openOrderDialog
  };
};
