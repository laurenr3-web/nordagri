import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Part } from '@/types/Part';

// Import part details
import PartDetails from '@/components/parts/PartDetails';
import { AddPartForm } from '@/components/parts/AddPartForm';

// Import dialogs
import AddCategoryDialog from '@/components/parts/dialogs/AddCategoryDialog';
import FilterDialog from '@/components/parts/dialogs/FilterDialog';
import SortDialog from '@/components/parts/dialogs/SortDialog';
import OrderDialog from '@/components/parts/dialogs/OrderDialog';

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
      <Dialog
        open={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
      >
        <DialogContent 
          className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <DialogHeader>
            <DialogTitle>Part Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected part
            </DialogDescription>
          </DialogHeader>
          {selectedPart && (
            <PartDetails 
              part={selectedPart} 
              onEdit={handleEditPart}
              onDelete={handleDeletePart}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Part Dialog */}
      <Dialog 
        open={isAddPartDialogOpen} 
        onOpenChange={setIsAddPartDialogOpen}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Part</DialogTitle>
            <DialogDescription>
              Fill out the form below to add a new part to the inventory
            </DialogDescription>
          </DialogHeader>
          <AddPartForm 
            onSuccess={handleAddPart}
            onCancel={() => setIsAddPartDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
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
