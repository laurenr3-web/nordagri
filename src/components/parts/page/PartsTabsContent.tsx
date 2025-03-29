
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartsContainer from '@/components/parts/PartsContainer';
import PartSearch from '@/components/parts/PartSearch';
import { usePartsContext } from '@/contexts/PartsContext';

interface PartsTabsContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PartsTabsContent: React.FC<PartsTabsContentProps> = ({ activeTab, setActiveTab }) => {
  const {
    partsHookData,
    handleAddPartFromSearch
  } = usePartsContext();

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-2 w-[400px]">
        <TabsTrigger value="inventory">Inventaire</TabsTrigger>
        <TabsTrigger value="search">Recherche technique</TabsTrigger>
      </TabsList>
      
      <TabsContent value="inventory" className="mt-6">
        <PartsContainer 
          parts={partsHookData.parts}
          filteredParts={partsHookData.filteredParts}
          isLoading={partsHookData.isLoading || false}
          isError={partsHookData.isError || false}
          categories={partsHookData.categories}
          currentView={partsHookData.currentView}
          setCurrentView={partsHookData.setCurrentView}
          searchTerm={partsHookData.searchTerm}
          setSearchTerm={partsHookData.setSearchTerm}
          selectedCategory={partsHookData.selectedCategory}
          setSelectedCategory={partsHookData.setSelectedCategory}
          filterManufacturers={partsHookData.filterManufacturers}
          manufacturers={partsHookData.manufacturers}
          toggleManufacturerFilter={partsHookData.toggleManufacturerFilter}
          filterMinPrice={partsHookData.filterMinPrice}
          setFilterMinPrice={partsHookData.setFilterMinPrice}
          filterMaxPrice={partsHookData.filterMaxPrice}
          setFilterMaxPrice={partsHookData.setFilterMaxPrice}
          filterInStock={partsHookData.filterInStock}
          setFilterInStock={partsHookData.setFilterInStock}
          filterCount={partsHookData.filterCount}
          clearFilters={partsHookData.clearFilters}
          sortBy={partsHookData.sortBy}
          setSortBy={partsHookData.setSortBy}
          isPartDetailsDialogOpen={partsHookData.isPartDetailsDialogOpen}
          setIsPartDetailsDialogOpen={partsHookData.setIsPartDetailsDialogOpen}
          isAddPartDialogOpen={partsHookData.isAddPartDialogOpen}
          setIsAddPartDialogOpen={partsHookData.setIsAddPartDialogOpen}
          isAddCategoryDialogOpen={partsHookData.isAddCategoryDialogOpen}
          setIsAddCategoryDialogOpen={partsHookData.setIsAddCategoryDialogOpen}
          isFilterDialogOpen={partsHookData.isFilterDialogOpen}
          setIsFilterDialogOpen={partsHookData.setIsFilterDialogOpen}
          isSortDialogOpen={partsHookData.isSortDialogOpen}
          setIsSortDialogOpen={partsHookData.setIsSortDialogOpen}
          isOrderDialogOpen={partsHookData.isOrderDialogOpen}
          setIsOrderDialogOpen={partsHookData.setIsOrderDialogOpen}
          selectedPart={partsHookData.selectedPart}
          setSelectedPart={partsHookData.setSelectedPart}
          orderQuantity={partsHookData.orderQuantity || ''}
          setOrderQuantity={(qty: string) => {
            if (partsHookData.setOrderQuantity) {
              partsHookData.setOrderQuantity(qty);
            }
          }}
          orderNote={partsHookData.orderNote}
          setOrderNote={partsHookData.setOrderNote}
          handleAddPart={partsHookData.handleAddPart}
          handleUpdatePart={partsHookData.handleUpdatePart}
          handleDeletePart={partsHookData.handleDeletePart}
          handleOrderSubmit={partsHookData.handleOrderSubmit}
          openPartDetails={partsHookData.openPartDetails}
          openOrderDialog={partsHookData.openOrderDialog}
        />
      </TabsContent>
      
      <TabsContent value="search" className="mt-6">
        <PartSearch onAddPartToInventory={handleAddPartFromSearch} />
      </TabsContent>
    </Tabs>
  );
};

export default PartsTabsContent;
