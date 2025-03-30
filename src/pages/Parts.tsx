
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import PartsContainer from '@/components/parts/PartsContainer';

// Sample parts data
const initialPartsData = partsData;

const Parts = () => {
  // The main hook provides a cleaner interface with more focused sub-hooks
  const partsHookData = useParts(initialPartsData);
  
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
              Gérez votre inventaire de pièces et commandez de nouvelles pièces
            </p>
          </div>
          
          <PartsContainer {...partsHookData} />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Parts;
