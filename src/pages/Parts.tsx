
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';

const Parts = () => {
  const { toast } = useToast();
  const partsHookData = useParts();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await checkAuthStatus();
        
        if (!status.authenticated) {
          toast({
            title: "Connexion requise",
            description: "Vous devez être connecté pour gérer vos pièces",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [toast]);
  
  // Convert setCurrentView to accept a string
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
            refetch={partsHookData.isError ? () => partsHookData.refetch() : undefined}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Parts;
