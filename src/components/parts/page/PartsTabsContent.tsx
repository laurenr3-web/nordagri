
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartsContainer from '@/components/parts/PartsContainer';
import PartSearch from '@/components/parts/PartSearch';
import { TechnicalInfoTab } from '@/components/parts/technical-info';
import { usePartsContext } from '@/contexts/PartsContext';

interface PartsTabsContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const PartsTabsContent: React.FC<PartsTabsContentProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const {
    partsHookData,
    orderNote,
    setOrderNote,
    partNumber,
    setPartNumber,
    handleAddPartFromSearch,
    handleSearch,
    isIdentifying
  } = usePartsContext();

  // Log when this component renders and what tab is active
  useEffect(() => {
    console.log("PartsTabsContent rendered with activeTab:", activeTab);
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <Tabs 
      value={activeTab} 
      onValueChange={handleTabChange}
      className="w-full mt-6"
    >
      <TabsList className="grid grid-cols-3 w-full max-w-2xl mb-6">
        <TabsTrigger value="inventory">Inventaire</TabsTrigger>
        <TabsTrigger value="search">Recherche</TabsTrigger>
        <TabsTrigger value="technical">Info Technique</TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="space-y-4">
        <PartsContainer
          parts={partsHookData.parts}
          filteredParts={partsHookData.filteredParts}
          isLoading={partsHookData.isLoading}
          isError={partsHookData.isError}
          categories={partsHookData.categories}
          currentView={partsHookData.currentView}
          setCurrentView={partsHookData.setCurrentView}
          selectedPart={partsHookData.selectedPart}
          setSelectedPart={partsHookData.setSelectedPart}
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
          orderQuantity={partsHookData.orderQuantity}
          setOrderQuantity={partsHookData.setOrderQuantity}
          orderNote={orderNote}
          setOrderNote={setOrderNote}
          handleAddPart={partsHookData.handleAddPart}
          handleUpdatePart={partsHookData.handleUpdatePart}
          handleDeletePart={partsHookData.handleDeletePart}
          handleOrderSubmit={partsHookData.handleOrderSubmit}
          openPartDetails={partsHookData.openPartDetails}
          openOrderDialog={partsHookData.openOrderDialog}
        />
      </TabsContent>

      <TabsContent value="search" className="space-y-4">
        <PartSearch
          onAddPartToInventory={handleAddPartFromSearch}
        />
      </TabsContent>

      <TabsContent value="technical" className="space-y-4">
        <TechnicalInfoTab partNumber={partNumber || ""} />
      </TabsContent>
    </Tabs>
  );
};

export default PartsTabsContent;
