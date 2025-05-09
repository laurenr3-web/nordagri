
import React, { useEffect, useState } from 'react';
import { useParts } from '@/hooks/useParts';
import MainLayout from '@/ui/layouts/MainLayout';
import PartsContainer from '@/components/parts/PartsContainer';
import { useToast } from '@/hooks/use-toast';
import { checkAuthStatus } from '@/utils/authUtils';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, MinusCircle } from "lucide-react";
import WithdrawalDialog from '@/components/parts/dialogs/WithdrawalDialog';

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
      <LayoutWrapper>
        <PageHeader 
          title="Gestion des pièces"
          description="Gérez votre inventaire de pièces et commandez de nouvelles pièces"
          action={
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => partsHookData.openWithdrawalDialog(partsHookData.filteredParts[0])}>
                <MinusCircle className="h-4 w-4 mr-1" /> Retirer une pièce
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" /> Ajouter une pièce
              </Button>
            </div>
          }
        />
        <PartsContainer 
          {...partsHookData}
          setCurrentView={setCurrentView}
          refetch={partsHookData.isError ? () => partsHookData.refetch() : undefined}
        />
        
        {/* Dialog for part withdrawal when no specific part is selected */}
        {partsHookData.isWithdrawalDialogOpen && !partsHookData.selectedPart && (
          <WithdrawalDialog 
            isOpen={partsHookData.isWithdrawalDialogOpen} 
            onOpenChange={partsHookData.setIsWithdrawalDialogOpen}
            part={null}
          />
        )}
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Parts;
