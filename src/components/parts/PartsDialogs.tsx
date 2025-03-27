import React from 'react';
import { Part } from '@/types/Part';

// Part details components
import PartDetailsDialog from '@/components/parts/dialogs/PartDetailsDialog';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';

// Dialog components
import FilterDialog from '@/components/parts/dialogs/FilterDialog';
import SortDialog from '@/components/parts/dialogs/SortDialog';
import OrderDialog from '@/components/parts/dialogs/OrderDialog';
import AddCategoryDialog from '@/components/parts/dialogs/AddCategoryDialog';

interface PartsDialogsProps {
  // Part and selection
  selectedPart: Part | null;
  
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
  handleEditPart?: (part: Part) => void;
  handleDeletePart?: (partId: number) => void;
}

const PartsDialogs: React.FC<PartsDialogsProps> = ({
  // Part and selection
  selectedPart,
  
  // Dialog states
  isPartDetailsDialogOpen,
  isAddPartDialogOpen,
  isAddCategoryDialogOpen,
  isFilterDialogOpen,
  isSortDialogOpen,
  isOrderDialogOpen,
  
  // Dialog setters
  setIsPartDetailsDialogOpen,
  setIsAddPartDialogOpen,
  setIsAddCategoryDialogOpen,
  setIsFilterDialogOpen,
  setIsSortDialogOpen,
  setIsOrderDialogOpen,
  
  // Other props
  manufacturers,
  filterManufacturers,
  toggleManufacturerFilter,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  filterInStock,
  setFilterInStock,
  resetFilters,
  applyFilters,
  sortBy,
  setSortBy,
  newCategory,
  setNewCategory,
  addNewCategory,
  orderQuantity,
  setOrderQuantity,
  orderNote,
  setOrderNote,
  isOrderSuccess,
  handleOrderSubmit,
  handleAddPart,
  handleEditPart,
  handleDeletePart
}) => {
  return (
    <>
      {/* Part Details Dialog */}
      <PartDetailsDialog
        isOpen={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
        selectedPart={selectedPart}
        onEdit={handleEditPart}
        onDelete={handleDeletePart}
      />
      
      {/* Add Part Dialog */}
      <AddPartDialog
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        onSuccess={handleAddPart}
      />
      
      {/* Filter Dialog */}
      <FilterDialog 
        isOpen={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        manufacturers={manufacturers || []}
        filterManufacturers={filterManufacturers || []}
        toggleManufacturerFilter={toggleManufacturerFilter || (() => {})}
        filterMinPrice={filterMinPrice || ''}
        setFilterMinPrice={setFilterMinPrice || (() => {})}
        filterMaxPrice={filterMaxPrice || ''}
        setFilterMaxPrice={setFilterMaxPrice || (() => {})}
        filterInStock={filterInStock || false}
        setFilterInStock={setFilterInStock || (() => {})}
        resetFilters={resetFilters || (() => {})}
        applyFilters={applyFilters || (() => {})}
      />
      
      {/* Sort Dialog */}
      <SortDialog 
        isOpen={isSortDialogOpen}
        onOpenChange={setIsSortDialogOpen}
        sortBy={sortBy || ''}
        setSortBy={setSortBy || (() => {})}
      />
      
      {/* Add Category Dialog */}
      <AddCategoryDialog 
        isOpen={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        newCategory={newCategory || ''}
        setNewCategory={setNewCategory || (() => {})}
        addNewCategory={addNewCategory || (() => {})}
      />
      
      {/* Order Dialog */}
      <OrderDialog 
        isOpen={isOrderDialogOpen}
        onOpenChange={setIsOrderDialogOpen}
        selectedPart={selectedPart}
        orderQuantity={orderQuantity || ''}
        setOrderQuantity={setOrderQuantity || (() => {})}
        orderNote={orderNote || ''}
        setOrderNote={setOrderNote || (() => {})}
        isOrderSuccess={isOrderSuccess || false}
        handleOrderSubmit={handleOrderSubmit || (() => {})}
      />
    </>
  );
};

export default PartsDialogs;
