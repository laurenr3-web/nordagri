
import React from 'react';
import { LocalPart, convertToLocalPart } from '@/utils/partTypeConverters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddPartForm from '@/components/parts/AddPartForm';
import PartDetails from '@/components/parts/PartDetails';
import { toast } from 'sonner';
import { Part } from '@/types/Part';

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
  handleAddPart?: (data: any) => void;
  handleUpdatePart?: (part: Part) => void;
  handleDeletePart?: (partId: string | number) => void;
  handleOrderPart?: (part: Part) => void;
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
  handleOrderPart,
  categories = []
}) => {
  
  // Handler pour l'ajout d'une pièce
  const handleAddPartSubmit = (partData: Partial<Part>) => {
    try {
      // Vérifier si on a les champs obligatoires
      if (!partData.name || !partData.partNumber || !partData.category) {
        toast.error("Données incomplètes", {
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }
      
      // Ajouter la pièce
      if (handleAddPart) {
        handleAddPart(partData);
      }
      
      // Fermer le dialogue
      setIsAddPartDialogOpen(false);
      
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
    try {
      // Vérifier si on a une pièce sélectionnée
      if (!selectedPart) {
        toast.error("Aucune pièce sélectionnée", {
          description: "Impossible de mettre à jour la pièce"
        });
        return;
      }
      
      // Vérifier si on a les champs obligatoires
      if (!selectedPart.name || !selectedPart.partNumber || !selectedPart.category) {
        toast.error("Données incomplètes", {
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }
      
      // Mettre à jour la pièce
      if (handleUpdatePart) {
        handleUpdatePart(selectedPart);
      }
      
      // Fermer le dialogue
      setIsPartDetailsDialogOpen(false);
      
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
      if (handleDeletePart) {
        handleDeletePart(selectedPart.id);
      }
      
      // Fermer le dialogue
      setIsPartDetailsDialogOpen(false);
      
      // Réinitialiser la pièce sélectionnée
      setSelectedPart(null);
      
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

  // Handler pour la commande d'une pièce
  const handleOrderPartConfirm = () => {
    if (!selectedPart) return;
    
    try {
      // Commander la pièce
      if (handleOrderPart) {
        handleOrderPart(selectedPart);
      }
      
      // Notification
      toast.success("Commande initiée", {
        description: `Commande pour ${selectedPart.name} initiée avec succès`
      });
      
      // Ne pas fermer le dialogue de détails automatiquement
    } catch (error) {
      console.error("Erreur lors de la commande de la pièce:", error);
      toast.error("Erreur", {
        description: "Impossible de commander la pièce. Veuillez réessayer."
      });
    }
  };

  console.log("État du dialogue d'ajout:", isAddPartDialogOpen);
  console.log("État du dialogue de détails:", isPartDetailsDialogOpen);
  console.log("Pièce sélectionnée:", selectedPart);
  
  return (
    <>
      {/* Dialogue d'ajout de pièce */}
      <Dialog open={isAddPartDialogOpen} onOpenChange={setIsAddPartDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle pièce</DialogTitle>
          </DialogHeader>
          <AddPartForm
            onSuccess={handleAddPartSubmit}
            onCancel={() => setIsAddPartDialogOpen(false)}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de détails de pièce */}
      <Dialog open={isPartDetailsDialogOpen} onOpenChange={setIsPartDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>Détails de la pièce</DialogTitle>
          </DialogHeader>
          {selectedPart && (
            <PartDetails
              part={selectedPart}
              onEdit={handleUpdatePartSubmit}
              onDelete={handleDeletePartConfirm}
              onOrder={handleOrderPart ? handleOrderPartConfirm : undefined}
              onDialogClose={() => setIsPartDetailsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PartsDialogs;
