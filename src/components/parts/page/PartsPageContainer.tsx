
import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';

const PartsPageContainer = () => {
  console.log("PartsPageContainer - Rendering and attempting to use context");
  
  // State to track if we're ready to use context
  const [isContextReady, setIsContextReady] = useState(false);
  const [contextError, setContextError] = useState<Error | null>(null);
  
  useEffect(() => {
    // This effect will run after the component is mounted
    // Set a small delay to ensure the context provider is fully initialized
    const timer = setTimeout(() => {
      setIsContextReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Only try to use context when we're ready
  if (!isContextReady) {
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 p-6">
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse">
              <p className="text-muted-foreground">Initializing parts management...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Wrap the context access in a try/catch to help with debugging
  try {
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
    
    // Log successful context access
    useEffect(() => {
      console.log("PartsPageContainer - Successfully connected to context");
    }, []);

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
  } catch (error) {
    // If we encounter an error with the context, update state and show error
    if (!contextError) {
      setContextError(error as Error);
      console.error("Error in PartsPageContainer:", error);
      
      // Show toast notification
      toast.error("Error loading parts management", {
        description: (error as Error)?.message || "Context unavailable"
      });
    }
    
    // Fallback UI for when the context is not available
    return (
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 p-6">
          <div className="w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-destructive">Error Loading Parts</h2>
            <p className="mb-4">Unable to load the parts management interface. This could be due to a context provider issue.</p>
            <p className="text-muted-foreground">{(contextError as Error)?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default PartsPageContainer;
