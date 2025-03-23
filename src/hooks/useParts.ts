
import { Part } from '@/types/Part';
import { usePartsSlice } from './parts/partsSlice';
import { useFilterSlice } from './parts/filterSlice';
import { useDialogSlice } from './parts/dialogSlice';
import { useOrderSlice } from './parts/orderSlice';

export const useParts = (initialParts: Part[]) => {
  // Use all the slices
  const partsSlice = usePartsSlice(initialParts);
  const filterSlice = useFilterSlice();
  const dialogSlice = useDialogSlice();
  const orderSlice = useOrderSlice();

  // Get derived values
  const categories = partsSlice.getCategories();
  const manufacturers = partsSlice.getManufacturers();
  const filteredParts = filterSlice.filterParts(partsSlice.parts, categories, manufacturers);
  const filterCount = filterSlice.getFilterCount();

  // Custom handlers that combine multiple slices
  const openPartDetails = (part: Part) => {
    dialogSlice.openPartDetails(part, partsSlice.setSelectedPart);
  };

  const openOrderDialog = (part: Part) => {
    dialogSlice.openOrderDialog(part, partsSlice.setSelectedPart);
    orderSlice.setOrderQuantity('1');
    orderSlice.setOrderNote('');
    orderSlice.setIsOrderSuccess(false);
  };

  const handleOrderSubmit = () => {
    orderSlice.handleOrderSubmit(
      partsSlice.selectedPart,
      partsSlice.parts,
      partsSlice.setParts,
      dialogSlice.setIsOrderDialogOpen
    );
  };

  const handleAddPart = (formData: any) => {
    partsSlice.handleAddPart(formData);
    dialogSlice.setIsAddPartDialogOpen(false);
  };

  const handleEditPart = (updatedPart: Part) => {
    partsSlice.handleEditPart(updatedPart);
    dialogSlice.setIsPartDetailsDialogOpen(false);
  };

  const handleDeletePart = (partId: number) => {
    partsSlice.handleDeletePart(partId);
    dialogSlice.setIsPartDetailsDialogOpen(false);
  };

  const addNewCategory = () => {
    const category = partsSlice.addNewCategory(dialogSlice.newCategory);
    if (category) {
      filterSlice.setSelectedCategory(category);
      dialogSlice.setNewCategory('');
      dialogSlice.setIsAddCategoryDialogOpen(false);
    }
  };

  const applyFilters = () => {
    dialogSlice.setIsFilterDialogOpen(false);
  };

  return {
    // State
    parts: partsSlice.parts,
    filteredParts,
    selectedPart: partsSlice.selectedPart,
    customCategories: partsSlice.customCategories,
    categories,
    manufacturers,
    searchTerm: filterSlice.searchTerm,
    selectedCategory: filterSlice.selectedCategory,
    currentView: filterSlice.currentView,
    filterManufacturers: filterSlice.filterManufacturers,
    filterMinPrice: filterSlice.filterMinPrice,
    filterMaxPrice: filterSlice.filterMaxPrice,
    filterInStock: filterSlice.filterInStock,
    sortBy: filterSlice.sortBy,
    newCategory: dialogSlice.newCategory,
    orderQuantity: orderSlice.orderQuantity,
    orderNote: orderSlice.orderNote,
    isOrderSuccess: orderSlice.isOrderSuccess,
    filterCount,
    
    // Dialog states
    isPartDetailsDialogOpen: dialogSlice.isPartDetailsDialogOpen,
    isAddPartDialogOpen: dialogSlice.isAddPartDialogOpen,
    isAddCategoryDialogOpen: dialogSlice.isAddCategoryDialogOpen,
    isFilterDialogOpen: dialogSlice.isFilterDialogOpen,
    isSortDialogOpen: dialogSlice.isSortDialogOpen,
    isOrderDialogOpen: dialogSlice.isOrderDialogOpen,
    
    // Setters
    setSearchTerm: filterSlice.setSearchTerm,
    setSelectedCategory: filterSlice.setSelectedCategory,
    setCurrentView: filterSlice.setCurrentView,
    setFilterManufacturers: filterSlice.setFilterManufacturers,
    setFilterMinPrice: filterSlice.setFilterMinPrice,
    setFilterMaxPrice: filterSlice.setFilterMaxPrice,
    setFilterInStock: filterSlice.setFilterInStock,
    setSortBy: filterSlice.setSortBy,
    setNewCategory: dialogSlice.setNewCategory,
    setOrderQuantity: orderSlice.setOrderQuantity,
    setOrderNote: orderSlice.setOrderNote,
    setIsPartDetailsDialogOpen: dialogSlice.setIsPartDetailsDialogOpen,
    setIsAddPartDialogOpen: dialogSlice.setIsAddPartDialogOpen,
    setIsAddCategoryDialogOpen: dialogSlice.setIsAddCategoryDialogOpen,
    setIsFilterDialogOpen: dialogSlice.setIsFilterDialogOpen,
    setIsSortDialogOpen: dialogSlice.setIsSortDialogOpen,
    setIsOrderDialogOpen: dialogSlice.setIsOrderDialogOpen,
    
    // Actions
    handleAddPart,
    applyFilters,
    resetFilters: filterSlice.resetFilters,
    addNewCategory,
    openPartDetails,
    openOrderDialog,
    handleOrderSubmit,
    toggleManufacturerFilter: filterSlice.toggleManufacturerFilter,
    handleEditPart,
    handleDeletePart
  };
};
