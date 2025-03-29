
import React, { useState, useEffect, useRef } from 'react';
import { Part } from '@/types/Part';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AddPartForm from '@/components/parts/AddPartForm';
import PartDetails from '@/components/parts/PartDetails';
import { toast } from 'sonner';

interface PartsDialogsProps {
  // États des dialogues
  isPartDetailsDialogOpen: boolean;
  isAddPartDialogOpen: boolean;
  
  // Setters pour les dialogues
  setIsPartDetailsDialogOpen: (open: boolean) => void;
  setIsAddPartDialogOpen: (open: boolean) => void;
  
  // Données et actions
  selectedPart: Part | null;
  setSelectedPart: (part: Part | null) => void;
  handleAddPart: (part: any) => void;
  handleUpdatePart: (part: Part) => void;
  handleDeletePart: (partId: number | string) => void;
  categories?: string[];
}

const PartsDialogs: React.FC<PartsDialogsProps> = ({
  // États des dialogues
  isPartDetailsDialogOpen,
  isAddPartDialogOpen,
  
  // Setters pour les dialogues
  setIsPartDetailsDialogOpen,
  setIsAddPartDialogOpen,
  
  // Données et actions
  selectedPart,
  setSelectedPart,
  handleAddPart,
  handleUpdatePart,
  handleDeletePart,
  categories = []
}) => {
  // Add mounted ref to track component lifecycle
  const isMountedRef = useRef(true);
  
  // Add state to track dialog closing animations
  const [isAddDialogClosing, setIsAddDialogClosing] = useState(false);
  const [isDetailsDialogClosing, setIsDetailsDialogClosing] = useState(false);
  
  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  console.log("PartsDialogs - Render with states:", {
    isAddPartDialogOpen,
    isPartDetailsDialogOpen,
    isAddDialogClosing,
    isDetailsDialogClosing,
    "selectedPart": selectedPart ? selectedPart.name : null 
  });
  
  // Handler pour l'ajout d'une pièce
  const handleAddPartSubmit = (partData: any) => {
    try {
      // Vérifier si on a les champs obligatoires
      if (!partData.name || !partData.partNumber || !partData.category) {
        toast.error("Données incomplètes", {
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }
      
      // Ajouter la pièce
      handleAddPart(partData);
      
      // Fermer le dialogue en toute sécurité
      handleAddDialogOpenChange(false);
      
      // Notification
      toast.success("Pièce ajoutée", {
        description: `La pièce ${partData.name} a été ajoutée avec succès`
      });
    } catch (error) {
      console.error("Erreur lors de l'ajout de la pièce:", error);
      toast.error("Erreur", {
        description: "Impossible d'ajouter la pièce. Veuillez réessayer."
      });
    }
  };
  
  // Handler pour la mise à jour d'une pièce
  const handleUpdatePartSubmit = () => {
    if (!selectedPart) return;
    
    try {
      // Mettre à jour la pièce
      handleUpdatePart(selectedPart);
      
      // Fermer le dialogue en toute sécurité
      handleDetailsDialogOpenChange(false);
      
      // Notification
      toast.success("Pièce mise à jour", {
        description: `La pièce ${selectedPart.name} a été mise à jour avec succès`
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la pièce:", error);
      toast.error("Erreur", {
        description: "Impossible de mettre à jour la pièce. Veuillez réessayer."
      });
    }
  };
  
  // Handler pour la suppression d'une pièce
  const handleDeletePartConfirm = () => {
    if (!selectedPart) return;
    
    try {
      // Récupérer les données avant de supprimer (pour le toast)
      const partName = selectedPart.name;
      
      // Supprimer la pièce
      handleDeletePart(selectedPart.id);
      
      // Fermer le dialogue en toute sécurité
      handleDetailsDialogOpenChange(false);
      
      // Réinitialiser la pièce sélectionnée après l'animation
      setTimeout(() => {
        if (isMountedRef.current) {
          setSelectedPart(null);
        }
      }, 300);
      
      // Notification
      toast.success("Pièce supprimée", {
        description: `La pièce ${partName} a été supprimée avec succès`
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la pièce:", error);
      toast.error("Erreur", {
        description: "Impossible de supprimer la pièce. Veuillez réessayer."
      });
    }
  };
  
  // Safe handlers for dialog open state changes
  const handleAddDialogOpenChange = (open: boolean) => {
    console.log("Changement d'état du dialogue d'ajout:", open);
    
    if (!open) {
      // First set closing state to trigger animation
      setIsAddDialogClosing(true);
      
      // Then update actual state after animation completes
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsAddPartDialogOpen(false);
          setIsAddDialogClosing(false);
        }
      }, 200);
    } else {
      setIsAddPartDialogOpen(true);
    }
  };
  
  const handleDetailsDialogOpenChange = (open: boolean) => {
    console.log("Changement d'état du dialogue de détails:", open);
    
    if (!open) {
      // First set closing state to trigger animation
      setIsDetailsDialogClosing(true);
      
      // Then update actual state after animation completes
      setTimeout(() => {
        if (isMountedRef.current) {
          setIsPartDetailsDialogOpen(false);
          setIsDetailsDialogClosing(false);
        }
      }, 200);
    } else {
      setIsPartDetailsDialogOpen(true);
    }
  };
  
  return (
    <>
      {/* Dialogue d'ajout de pièce */}
      {(isAddPartDialogOpen || isAddDialogClosing) && (
        <Dialog 
          open={isAddPartDialogOpen && !isAddDialogClosing} 
          onOpenChange={handleAddDialogOpenChange}
        >
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle pièce</DialogTitle>
              <DialogDescription>
                Remplissez les détails pour ajouter une nouvelle pièce à l'inventaire
              </DialogDescription>
            </DialogHeader>
            <AddPartForm
              onSuccess={handleAddPartSubmit}
              onCancel={() => handleAddDialogOpenChange(false)}
              categories={categories}
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Dialogue de détails de pièce */}
      {(isPartDetailsDialogOpen || isDetailsDialogClosing) && selectedPart && (
        <Dialog 
          open={isPartDetailsDialogOpen && !isDetailsDialogClosing} 
          onOpenChange={handleDetailsDialogOpenChange}
        >
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Détails de la pièce</DialogTitle>
              <DialogDescription>
                Informations détaillées sur cette pièce
              </DialogDescription>
            </DialogHeader>
            <PartDetails
              part={selectedPart}
              onEdit={handleUpdatePartSubmit}
              onDelete={handleDeletePartConfirm}
              onDialogClose={() => handleDetailsDialogOpenChange(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PartsDialogs;
