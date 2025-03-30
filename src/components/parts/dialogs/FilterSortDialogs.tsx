
import React from 'react';
import FilterDialog from './FilterDialog';
import SortDialog from './SortDialog';

interface FilterSortDialogsProps {
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
  isSortDialogOpen: boolean;
  setIsSortDialogOpen: (open: boolean) => void;
}

const FilterSortDialogs: React.FC<FilterSortDialogsProps> = ({
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  isSortDialogOpen,
  setIsSortDialogOpen
}) => {
  return (
    <>
      <FilterDialog
        isOpen={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
      />
      
      <SortDialog
        isOpen={isSortDialogOpen}
        onOpenChange={setIsSortDialogOpen}
      />
    </>
  );
};

export default FilterSortDialogs;
