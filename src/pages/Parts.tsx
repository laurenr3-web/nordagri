
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
import { WithdrawalDialog } from '@/components/parts/dialogs/withdrawal';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import ExpressAddPartDialog from '@/components/parts/dialogs/ExpressAddPartDialog';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { Part } from '@/types/Part';
import PartDetailsDialog from '@/components/parts/dialogs/PartDetailsDialog';

const Parts = () => {
  const { toast } = useToast();
  const partsHookData = useParts();
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isExpressAddDialogOpen, setIsExpressAddDialogOpen] = useState(false);
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<Part | null>(null);

  // Utiliser le hook usePartsWithdrawal pour gérer l'état du dialogue de retrait
  const { 
    isWithdrawalDialogOpen, 
    setIsWithdrawalDialogOpen, 
    selectedPart,
    openWithdrawalDialog
  } = usePartsWithdrawal();
  
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

  // Fonction pour ouvrir les détails d'une pièce
  const handleOpenPartDetails = (part: Part) => {
    console.log("Opening part details for:", part);
    setSelectedPartForDetails(part);
    setIsPartDetailsDialogOpen(true);
  };
  
  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Gestion des pièces"
          description="Gérez votre inventaire de pièces et commandez de nouvelles pièces"
          action={
            <div className="flex space-x-2">
              <Button size="sm" variant="outline" onClick={() => setIsWithdrawalDialogOpen(true)}>
                <MinusCircle className="h-4 w-4 mr-1" /> Retirer une pièce
              </Button>
              <Button size="sm" onClick={() => setIsAddPartDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Ajouter une pièce
              </Button>
            </div>
          }
        />
        <PartsContainer 
          {...partsHookData}
          setCurrentView={setCurrentView}
          refetch={partsHookData.isError ? () => partsHookData.refetch() : undefined}
          onAddPart={() => setIsAddPartDialogOpen(true)}
          onWithdrawPart={() => setIsWithdrawalDialogOpen(true)}
          openPartDetails={handleOpenPartDetails}
        />
        
        {/* Dialog for part withdrawal when no specific part is selected */}
        <WithdrawalDialog 
          isOpen={isWithdrawalDialogOpen} 
          onOpenChange={setIsWithdrawalDialogOpen}
          part={selectedPart}
        />
        
        {/* Dialog for adding parts */}
        <AddPartDialog
          isOpen={isAddPartDialogOpen}
          onOpenChange={setIsAddPartDialogOpen}
        />
        
        {/* Dialog for express adding parts */}
        <ExpressAddPartDialog
          isOpen={isExpressAddDialogOpen}
          onOpenChange={setIsExpressAddDialogOpen}
        />

        {/* Dialog for part details */}
        <PartDetailsDialog
          isOpen={isPartDetailsDialogOpen}
          onOpenChange={setIsPartDetailsDialogOpen}
          selectedPart={selectedPartForDetails}
        />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Parts;
