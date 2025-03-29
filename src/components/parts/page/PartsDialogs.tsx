
import React from 'react';
import FilterSortDialogs from '@/components/parts/dialogs/FilterSortDialogs';
import PartManagementDialogs from '@/components/parts/dialogs/PartManagementDialogs';
import OrderManagementDialog from '@/components/parts/dialogs/OrderManagementDialog';
import { usePartsContext } from '@/contexts/PartsContext';

const PartsDialogs = () => {
  const {
    partsHookData,
    selectedPartAsLocalPart,
    orderNote,
    setOrderNote
  } = usePartsContext();

  return (
    <>
      <FilterSortDialogs
        isFilterDialogOpen={partsHookData.isFilterDialogOpen}
        isSortDialogOpen={partsHookData.isSortDialogOpen}
        isAddCategoryDialogOpen={partsHookData.isAddCategoryDialogOpen}
        setIsFilterDialogOpen={partsHookData.setIsFilterDialogOpen}
        setIsSortDialogOpen={partsHookData.setIsSortDialogOpen}
        setIsAddCategoryDialogOpen={partsHookData.setIsAddCategoryDialogOpen}
        manufacturers={partsHookData.manufacturers}
        filterManufacturers={partsHookData.filterManufacturers}
        toggleManufacturerFilter={partsHookData.toggleManufacturerFilter}
        filterMinPrice={partsHookData.filterMinPrice}
        setFilterMinPrice={partsHookData.setFilterMinPrice}
        filterMaxPrice={partsHookData.filterMaxPrice}
        setFilterMaxPrice={partsHookData.setFilterMaxPrice}
        filterInStock={partsHookData.filterInStock}
        setFilterInStock={partsHookData.setFilterInStock}
        resetFilters={partsHookData.clearFilters}
        sortBy={partsHookData.sortBy}
        setSortBy={partsHookData.setSortBy}
        newCategory={partsHookData.newCategory}
        setNewCategory={partsHookData.setNewCategory}
        addNewCategory={partsHookData.addNewCategory}
      />
      
      <PartManagementDialogs
        selectedPart={selectedPartAsLocalPart}
        isPartDetailsDialogOpen={partsHookData.isPartDetailsDialogOpen}
        isAddPartDialogOpen={partsHookData.isAddPartDialogOpen}
        setIsPartDetailsDialogOpen={partsHookData.setIsPartDetailsDialogOpen}
        setIsAddPartDialogOpen={partsHookData.setIsAddPartDialogOpen}
        handleEditPart={partsHookData.handleUpdatePart}
        handleDeletePart={partsHookData.handleDeletePart}
        handleAddPart={partsHookData.handleAddPart}
      />
      
      <OrderManagementDialog
        selectedPart={selectedPartAsLocalPart}
        isOrderDialogOpen={partsHookData.isOrderDialogOpen}
        setIsOrderDialogOpen={partsHookData.setIsOrderDialogOpen}
        orderQuantity={partsHookData.orderQuantity}
        setOrderQuantity={partsHookData.setOrderQuantity}
        orderNote={orderNote}
        setOrderNote={setOrderNote}
        handleOrderSubmit={partsHookData.handleOrderSubmit}
      />
    </>
  );
};

export default PartsDialogs;
