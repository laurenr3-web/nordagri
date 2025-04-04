
import React, { useEffect } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import { useParts } from '@/hooks/useParts';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';

const Parts = () => {
  const { toast } = useToast();
  // Initialize without arguments
  const partsHookData = useParts();
  
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
    <MainLayout>
      <div className="flex-1">
        <div className="px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold">Gestion des pièces</h1>
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
      </div>
    </MainLayout>
  );
};

export default Parts;
