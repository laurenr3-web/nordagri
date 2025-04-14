
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useParts } from '@/hooks/useParts';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { supabase } from '@/integrations/supabase/client';

const Parts = () => {
  const { toast } = useToast();
  // Initialize without arguments
  const partsHookData = useParts();
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const status = await checkAuthStatus();
        
        if (!status.isAuthenticated) {
          toast({
            title: "Connexion requise",
            description: "Vous devez être connecté pour gérer vos pièces",
            variant: "destructive",
          });
        }
        
        // Vérification directe des données dans Supabase
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;
        
        if (userId) {
          const { data, error } = await supabase
            .from('parts_inventory')
            .select('*')
            .eq('owner_id', userId);
            
          console.log('🔍 Vérification directe des pièces dans Supabase:', {
            userId,
            piècesTrouvées: data?.length || 0,
            données: data,
            erreur: error
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
            refetch={partsHookData.isError ? () => partsHookData.refetch() : undefined}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Parts;
