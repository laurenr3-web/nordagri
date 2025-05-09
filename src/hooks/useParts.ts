
import { Part } from '@/types/Part';
import { usePartsData } from './parts/usePartsData';
import { usePartsFilter } from './parts/usePartsFilter';
import { useOrderParts } from './parts/useOrderParts';
import { usePartsDialogs } from './parts/usePartsDialogs';
import { usePartsCategories } from './parts/usePartsCategories';
import { usePartsActions } from './parts/usePartsActions';
import { useCreatePart, useUpdatePart, useDeletePart } from './usePartsMutations';
import { usePartsRealtime } from './parts/usePartsRealtime';
import { usePartsWithdrawal } from './parts/usePartsWithdrawal';
import { convertToPart } from '@/utils/partTypeConverters';

// Define a more strictly typed version of Part for internal use
export interface SafePart extends Omit<Part, 'compatibility'> {
  compatibility: number[]; // Always number[]
}

// Main hook that composes all parts-related functionality
export const useParts = () => {
  // Import all the specialized hooks
  const partsQuery = usePartsData();
  const partsFilter = usePartsFilter();
  const orderParts = useOrderParts();
  const partsDialogs = usePartsDialogs();
  const partsWithdrawal = usePartsWithdrawal();
  
  // Get the parts data from the query result and convert to SafePart
  const data: SafePart[] = (partsQuery.data || []).map(part => ({
    ...part,
    compatibility: Array.isArray(part.compatibility) 
      ? part.compatibility.map(id => Number(id)) 
      : []
  }));
  
  const partsCategories = usePartsCategories(data as Part[]);
  const partsActions = usePartsActions(partsDialogs, orderParts);
  
  // Get mutation hooks
  const createPartMutation = useCreatePart();
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();
  
  // Setup realtime updates
  const realtimeStatus = usePartsRealtime();
  
  // Apply filters to get filtered parts
  const filteredParts = partsFilter.filterParts(data as Part[]);
  
  // Part mutation handlers
  const handleAddPart = (part: Omit<Part, 'id'>) => {
    return createPartMutation.mutate(part);
  };
  
  const handleUpdatePart = (part: Part) => {
    // Ensure compatibility is number[]
    const safePart = {
      ...part,
      compatibility: Array.isArray(part.compatibility) 
        ? part.compatibility.map(id => Number(id)) 
        : []
    };
    return updatePartMutation.mutate(safePart);
  };
  
  const handleDeletePart = (partId: number | string) => {
    return deletePartMutation.mutate(partId);
  };

  // Log current state for debugging
  console.log('useParts hook state:', {
    partsCount: data.length,
    filteredPartsCount: filteredParts.length,
    isLoading: partsQuery.isLoading,
    isError: partsQuery.isError,
    error: partsQuery.error
  });
  
  return {
    // Parts data
    parts: data as unknown as Part[],
    isLoading: partsQuery.isLoading,
    isError: partsQuery.isError,
    error: partsQuery.error,
    refetch: partsQuery.refetch,
    
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
    filteredParts: filteredParts as unknown as Part[],
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
    
    // Withdrawal functionality
    ...partsWithdrawal,
    
    // Actions
    handleAddPart,
    handleUpdatePart,
    handleDeletePart,
    handleOrderSubmit: partsActions.handleOrderSubmit,
    openPartDetails: partsActions.openPartDetails,
    openOrderDialog: partsActions.openOrderDialog,
    
    // Realtime status
    realtimeStatus
  };
};
