import React from 'react';
import { LocalPart, convertToLocalPart } from '@/utils/partTypeConverters';
import PartManagementDialogs from '@/components/parts/dialogs/PartManagementDialogs';
import FilterSortDialogs from '@/components/parts/dialogs/FilterSortDialogs';
import OrderManagementDialog from '@/components/parts/dialogs/OrderManagementDialog';

interface PartsDialogsProps {
  // Part and selection
  selectedPart: LocalPart | null;
  
  // Dialog states
  isPartDetailsDialogOpen: boolean;
  isAddPartDialogOpen: boolean;
  isAddCategoryDialogOpen: boolean;
  isFilterDialogOpen: boolean;
  isSortDialogOpen: boolean;
  isOrderDialogOpen: boolean;
  
  // Dialog setters
  setIsPartDetailsDialogOpen: (open: boolean) => void;
  setIsAddPartDialogOpen: (open: boolean) => void;
  setIsAddCategoryDialogOpen: (open: boolean) => void;
  setIsFilterDialogOpen: (open: boolean) => void;
  setIsSortDialogOpen: (open: boolean) => void;
  setIsOrderDialogOpen: (open: boolean) => void;
  
  // Other props needed for dialogs
  manufacturers?: string[];
  filterManufacturers?: string[];
  toggleManufacturerFilter?: (manufacturer: string) => void;
  filterMinPrice?: string;
  setFilterMinPrice?: (value: string) => void;
  filterMaxPrice?: string;
  setFilterMaxPrice?: (value: string) => void;
  filterInStock?: boolean;
  setFilterInStock?: (value: boolean) => void;
  resetFilters?: () => void;
  applyFilters?: () => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  newCategory?: string;
  setNewCategory?: (category: string) => void;
  addNewCategory?: () => void;
  orderQuantity?: string;
  setOrderQuantity?: (quantity: string) => void;
  orderNote?: string;
  setOrderNote?: (note: string) => void;
  isOrderSuccess?: boolean;
  handleOrderSubmit?: () => void;
  handleAddPart?: (data: any) => void;
  handleEditPart?: (part: LocalPart) => void;
  handleDeletePart?: (partId: number | string) => void;
}

const PartsDialogs: React.FC<PartsDialogsProps> = (props) => {
  // Create a wrapper function for handling part edits
  const handleEditPartWrapper = (part: any) => {
    if (props.handleEditPart) {
      const localPart = convertToLocalPart(part);
      props.handleEditPart(localPart);
    }
  };

  return (
    <>
      {/* Part Management Dialogs - Details and Add Part */}
      <PartManagementDialogs
        selectedPart={props.selectedPart}
        isPartDetailsDialogOpen={props.isPartDetailsDialogOpen}
        isAddPartDialogOpen={props.isAddPartDialogOpen}
        setIsPartDetailsDialogOpen={props.setIsPartDetailsDialogOpen}
        setIsAddPartDialogOpen={props.setIsAddPartDialogOpen}
        handleEditPart={props.handleEditPart}
        handleDeletePart={props.handleDeletePart}
        handleAddPart={props.handleAddPart}
      />
      
      {/* Filter, Sort and Category Dialogs */}
      <FilterSortDialogs
        isFilterDialogOpen={props.isFilterDialogOpen}
        setIsFilterDialogOpen={props.setIsFilterDialogOpen}
        isSortDialogOpen={props.isSortDialogOpen}
        setIsSortDialogOpen={props.setIsSortDialogOpen}
        isAddCategoryDialogOpen={props.isAddCategoryDialogOpen} 
        setIsAddCategoryDialogOpen={props.setIsAddCategoryDialogOpen}
        manufacturers={props.manufacturers}
        filterManufacturers={props.filterManufacturers}
        toggleManufacturerFilter={props.toggleManufacturerFilter}
        filterMinPrice={props.filterMinPrice}
        setFilterMinPrice={props.setFilterMinPrice}
        filterMaxPrice={props.filterMaxPrice}
        setFilterMaxPrice={props.setFilterMaxPrice}
        filterInStock={props.filterInStock}
        setFilterInStock={props.setFilterInStock}
        resetFilters={props.resetFilters}
        applyFilters={props.applyFilters}
        sortBy={props.sortBy}
        setSortBy={props.setSortBy}
        newCategory={props.newCategory}
        setNewCategory={props.setNewCategory}
        addNewCategory={props.addNewCategory}
      />
      
      {/* Order Management Dialog */}
      <OrderManagementDialog
        selectedPart={props.selectedPart}
        isOrderDialogOpen={props.isOrderDialogOpen}
        setIsOrderDialogOpen={props.setIsOrderDialogOpen}
        orderQuantity={props.orderQuantity}
        setOrderQuantity={props.setOrderQuantity}
        orderNote={props.orderNote}
        setOrderNote={props.setOrderNote}
        isOrderSuccess={props.isOrderSuccess}
        handleOrderSubmit={props.handleOrderSubmit}
      />
    </>
  );
};

export default PartsDialogs;
