
import React, { useEffect } from 'react';
import { useParts } from '@/hooks/useParts';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';
import { toast } from 'sonner';

const Parts = () => {
  const { toast: uiToast } = useToast();
  // Initialize without arguments
  const partsHookData = useParts();
  
  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      const status = await checkAuthStatus();
      
      if (!status.isAuthenticated) {
        uiToast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour gérer vos pièces",
          variant: "destructive",
        });
      } else {
        console.log("Utilisateur authentifié:", status.session?.user?.id);
      }
    };
    
    checkAuth();
  }, [uiToast]);
  
  // Convertir setCurrentView pour qu'il accepte un string
  const setCurrentView = (view: string) => {
    if (view === 'grid' || view === 'list') {
      partsHookData.setCurrentView(view as PartsView);
    }
  };
  
  const handleDebugClick = () => {
    console.log("=== DÉBOGAGE DE LA PAGE PIÈCES ===");
    console.log("Nombre total de pièces:", partsHookData.parts.length);
    console.log("Pièces filtrées:", partsHookData.filteredParts.length);
    console.log("État de chargement:", partsHookData.isLoading);
    console.log("Erreur:", partsHookData.isError);
    console.log("Filtres actifs:", partsHookData.filterCount);
    console.log("Données brutes:", partsHookData.parts);
    
    toast.info("Débogage", {
      description: "Informations de débogage envoyées à la console"
    });
  };
  
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Gestion des pièces</h1>
            <p className="text-muted-foreground mt-1">
              Gérez votre inventaire de pièces et commandez de nouvelles pièces
            </p>
          </div>
          
          {/* Bouton de débogage */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDebugClick}
            className="flex items-center gap-1"
          >
            <Bug className="h-4 w-4" />
            <span>Debug</span>
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-4 pb-4">
        <div className="mx-auto max-w-7xl">
          <PartsContainer 
            {...partsHookData}
            setCurrentView={setCurrentView}
          />
        </div>
      </div>
    </div>
  );
};

export default Parts;
