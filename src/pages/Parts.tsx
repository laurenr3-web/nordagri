
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PartsContainer from '@/components/parts/PartsContainer';
import PartSearch from '@/components/parts/PartSearch';
import { Part } from '@/types/Part';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  // The main hook now provides a cleaner interface with more focused sub-hooks
  const partsHookData = useParts(initialPartsData);
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Debug logging for parts data updates
  useEffect(() => {
    console.log("Données parts mises à jour:", partsHookData.parts);
  }, [partsHookData.parts]);

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
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-[400px]">
              <TabsTrigger value="inventory">Inventaire</TabsTrigger>
              <TabsTrigger value="search">Recherche web</TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory" className="mt-6">
              <PartsContainer {...partsHookData} />
            </TabsContent>
            
            <TabsContent value="search" className="mt-6">
              <PartSearch onAddPartToInventory={handleAddPartFromSearch} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Parts;
