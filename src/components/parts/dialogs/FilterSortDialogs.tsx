
import React from 'react';
import FilterDialog from './FilterDialog';
import SortDialog from './SortDialog';

interface FilterSortDialogsProps {
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
  isSortDialogOpen: boolean;
  setIsSortDialogOpen: (open: boolean) => void;
  
  // Add missing props from FilterDialog and SortDialog
  manufacturers?: string[];
  filterManufacturers?: string[];
  toggleManufacturerFilter?: (manufacturer: string) => void;
  filterMinPrice?: string | number;
  setFilterMinPrice?: (value: string) => void;
  filterMaxPrice?: string | number;
  setFilterMaxPrice?: (value: string) => void;
  filterInStock?: boolean;
  setFilterInStock?: (value: boolean) => void;
  resetFilters?: () => void;
  applyFilters?: () => void;
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  
  // Optional category dialog props
  isAddCategoryDialogOpen?: boolean;
  setIsAddCategoryDialogOpen?: (open: boolean) => void;
  newCategory?: string;
  setNewCategory?: (category: string) => void;
  addNewCategory?: () => void;
}

const FilterSortDialogs: React.FC<FilterSortDialogsProps> = ({
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  isSortDialogOpen,
  setIsSortDialogOpen,
  manufacturers = [],
  filterManufacturers = [],
  toggleManufacturerFilter = () => {},
  filterMinPrice = '',
  setFilterMinPrice = () => {},
  filterMaxPrice = '',
  setFilterMaxPrice = () => {},
  filterInStock = false,
  setFilterInStock = () => {},
  resetFilters = () => {},
  applyFilters = () => {},
  sortBy = 'name-asc',
  setSortBy = () => {},
  isAddCategoryDialogOpen,
  setIsAddCategoryDialogOpen,
  newCategory,
  setNewCategory,
  addNewCategory
}) => {
  return (
    <>
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
        manufacturers={manufacturers}
        filterManufacturers={filterManufacturers}
        toggleManufacturerFilter={toggleManufacturerFilter}
        filterMinPrice={filterMinPrice as string}
        setFilterMinPrice={setFilterMinPrice}
        filterMaxPrice={filterMaxPrice as string}
        setFilterMaxPrice={setFilterMaxPrice}
        filterInStock={filterInStock}
        setFilterInStock={setFilterInStock}
        resetFilters={resetFilters}
        applyFilters={applyFilters}
      />
      
      <SortDialog
        isOpen={isSortDialogOpen}
        onOpenChange={setIsSortDialogOpen}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
    </>
  );
};

export default FilterSortDialogs;
