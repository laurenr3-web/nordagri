
import React from 'react';
import FilterDialog from '@/components/parts/dialogs/FilterDialog';
import SortDialog from '@/components/parts/dialogs/SortDialog';
import AddCategoryDialog from '@/components/parts/dialogs/AddCategoryDialog';

interface FilterSortDialogsProps {
  isFilterDialogOpen: boolean;
  isSortDialogOpen: boolean;
  isAddCategoryDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
  setIsSortDialogOpen: (open: boolean) => void;
  setIsAddCategoryDialogOpen: (open: boolean) => void;
  
  // Filter props
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
  
  // Sort props
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  
  // Category props
  newCategory?: string;
  setNewCategory?: (category: string) => void;
  addNewCategory?: () => void;
}

const FilterSortDialogs: React.FC<FilterSortDialogsProps> = ({
  isFilterDialogOpen,
  isSortDialogOpen,
  isAddCategoryDialogOpen,
  setIsFilterDialogOpen,
  setIsSortDialogOpen,
  setIsAddCategoryDialogOpen,
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
  addNewCategory
}) => {
  return (
    <>
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
      
      <SortDialog 
        isOpen={isSortDialogOpen}
        onOpenChange={setIsSortDialogOpen}
        sortBy={sortBy || ''}
        setSortBy={setSortBy || (() => {})}
      />
      
      <AddCategoryDialog 
        isOpen={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        newCategory={newCategory || ''}
        setNewCategory={setNewCategory || (() => {})}
        addNewCategory={addNewCategory || (() => {})}
      />
    </>
  );
};

export default FilterSortDialogs;
