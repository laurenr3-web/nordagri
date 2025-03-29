import React, { useState, useEffect } from 'react';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartsContainer from '@/components/parts/PartsContainer';
import PartSearch from '@/components/parts/PartSearch';
import Navbar from '@/components/layout/Navbar';
import { Part } from '@/types/Part';
import PartToolbar from '@/components/parts/PartToolbar';
import PhotoCaptureModal from '@/components/parts/PhotoCaptureModal';
import { identifyPartFromImage } from '@/services/openai/partVisionService';
import { toast } from 'sonner';
import FilterSortDialogs from '@/components/parts/dialogs/FilterSortDialogs';
import PartManagementDialogs from '@/components/parts/dialogs/PartManagementDialogs';
import { LocalPart, convertToLocalPart } from '@/utils/partTypeConverters';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  // The main hook now provides a cleaner interface with more focused sub-hooks
  const partsHookData = useParts(initialPartsData);
  const [activeTab, setActiveTab] = useState('inventory');
  const [orderNote, setOrderNote] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  
  // Debug logging for parts data updates
  useEffect(() => {
    console.log("Données parts mises à jour:", partsHookData.parts);
  }, [partsHookData.parts]);
  
  // Debug logging for dialog states
  useEffect(() => {
    console.log("États dialogues:", {
      isPartDetailsDialogOpen: partsHookData.isPartDetailsDialogOpen,
      isAddPartDialogOpen: partsHookData.isAddPartDialogOpen,
      isFilterDialogOpen: partsHookData.isFilterDialogOpen,
      isSortDialogOpen: partsHookData.isSortDialogOpen,
      selectedPart: partsHookData.selectedPart?.name
    });
  }, [
    partsHookData.isPartDetailsDialogOpen,
    partsHookData.isAddPartDialogOpen,
    partsHookData.isFilterDialogOpen,
    partsHookData.isSortDialogOpen,
    partsHookData.selectedPart
  ]);

  const handleAddPartFromSearch = (part: Part) => {
    // Pré-traiter la pièce avant de l'ajouter à l'inventaire
    const newPart = {
      ...part,
      inStock: true,
      stock: part.stock || 1, // Ensure stock field is populated
      reorderPoint: part.reorderPoint || 1, // Ensure reorderPoint is populated
      isFromSearch: true // Flag it as coming from search
    };
    
    partsHookData.handleAddPart(newPart);
  };

  const handleSearch = (searchText: string) => {
    partsHookData.setSearchTerm(searchText);
    // Si on est dans l'onglet recherche, passer à l'onglet inventaire
    if (activeTab === 'search') {
      setActiveTab('inventory');
    }
  };

  const handlePhotoTaken = async (imageData: string) => {
    setIsIdentifying(true);
    toast.info("Analyse de l'image en cours...");
    
    try {
      const result = await identifyPartFromImage(imageData);
      
      // Si on a une référence, la mettre dans le champ de recherche
      if (result.referenceNumber) {
        setPartNumber(result.referenceNumber);
        
        // Lancer la recherche automatiquement
        handleSearch(result.referenceNumber);
        
        toast.success(`Pièce identifiée: ${result.probableName}`, {
          description: `Référence: ${result.referenceNumber}`
        });
      } else {
        // Sinon, afficher les informations disponibles
        toast.info(`Type de pièce identifié: ${result.probableName}`, {
          description: "Aucune référence précise n'a pu être détectée."
        });
        
        // Mettre une description générique dans le champ de recherche
        setPartNumber(`${result.probableName} ${result.manufacturer || ''}`);
        handleSearch(`${result.probableName} ${result.manufacturer || ''}`);
      }
    } catch (error) {
      console.error("Erreur d'identification:", error);
      toast.error("Impossible d'identifier la pièce", {
        description: "Essayez avec une photo plus claire ou de meilleure qualité."
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  // Conversion du selectedPart pour éviter les problèmes de type
  const selectedPartAsLocalPart = partsHookData.selectedPart 
    ? (convertToLocalPart(partsHookData.selectedPart) as LocalPart) 
    : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Gestion des pièces</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre inventaire de pièces et recherchez de nouvelles pièces
            </p>
          </div>
          
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
          
          {/* Ajout explicite des dialogues pour éviter les problèmes de rendu */}
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
        </div>
      </div>
      
      {/* Modal de capture photo */}
      <PhotoCaptureModal 
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onPhotoTaken={handlePhotoTaken}
      />
    </SidebarProvider>
  );
};

export default Parts;
