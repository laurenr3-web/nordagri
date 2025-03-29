import React, { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartsContainer from '@/components/parts/PartsContainer';
import PartSearch from '@/components/parts/PartSearch';
import Navbar from '@/components/layout/Navbar';
import PartToolbar from '@/components/parts/PartToolbar';
import PhotoCaptureModal from '@/components/parts/PhotoCaptureModal';
import { usePartsContext } from '@/contexts/PartsContext';
import PartsHeader from './PartsHeader';
import PartsDialogs from './PartsDialogs';

const PartsPageContainer = () => {
  const {
    partsHookData,
    selectedPartAsLocalPart,
    orderNote,
    setOrderNote,
    isPhotoModalOpen,
    setIsPhotoModalOpen,
    handleAddPartFromSearch,
    handlePhotoTaken,
    handleSearch
  } = usePartsContext();
  
  const [activeTab, setActiveTab] = useState('inventory');

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar className="border-r">
        <Navbar />
      </Sidebar>
      
      <div className="flex-1 p-6">
        <PartsHeader />
        
        {/* Barre d'outils avec bouton caméra */}
        <PartToolbar 
          onPhotoClick={() => setIsPhotoModalOpen(true)} 
        />
        
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
          
          <TabsContent value="search" className="mt-6">
            <PartSearch onAddPartToInventory={handleAddPartFromSearch} />
          </TabsContent>
        </Tabs>
        
        {/* Render dialogs explicitly to ensure they're always in the DOM */}
        <PartsDialogs />
      </div>
      
      {/* Modal de capture photo */}
      <PhotoCaptureModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </div>
  );
};

export default PartsPageContainer;
