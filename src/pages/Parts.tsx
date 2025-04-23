
import React, { useEffect, useState } from 'react';
import { useParts } from '@/hooks/useParts';
import MainLayout from '@/ui/layouts/MainLayout';
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
  
  const setCurrentView = (view: string) => {
    if (view === 'grid' || view === 'list') {
      partsHookData.setCurrentView(view as PartsView);
    }
  };
  
  return (
    <MainLayout>
      <div className="px-3 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Gestion des pièces</h1>
          <p className="text-muted-foreground mt-1 text-base">Gérez votre inventaire de pièces et commandez de nouvelles pièces</p>
        </div>
        <PartsContainer 
          {...partsHookData}
          setCurrentView={setCurrentView}
          refetch={partsHookData.isError ? () => partsHookData.refetch() : undefined}
        />
      </div>
    </MainLayout>
  );
};

export default Parts;
