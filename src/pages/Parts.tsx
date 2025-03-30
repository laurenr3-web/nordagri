
import React, { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';

const Parts = () => {
  const { toast } = useToast();
  // Initialize with an empty array - no example data
  const partsHookData = useParts([]);
  
  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const status = await checkAuthStatus();
      
      if (!status.isAuthenticated) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour gérer vos pièces",
          variant: "destructive",
        });
      }
    };
    
    checkAuth();
  }, [toast]);
  
  // Convertir setCurrentView pour qu'il accepte un string
  const setCurrentView = (view: string) => {
    if (view === 'grid' || view === 'list') {
      partsHookData.setCurrentView(view as PartsView);
    }
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
              Gérez votre inventaire de pièces et commandez de nouvelles pièces
            </p>
          </div>
          
          <PartsContainer 
            {...partsHookData}
            setCurrentView={setCurrentView}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Parts;
