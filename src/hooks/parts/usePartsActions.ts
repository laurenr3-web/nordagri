
import { Part } from '@/types/Part';
import { toast } from 'sonner';

export const usePartsActions = (
  partsDialogs: {
    selectedPart: Part | null;
    setSelectedPart: (part: Part | null) => void;
    setIsPartDetailsDialogOpen: (isOpen: boolean) => void;
    setIsOrderDialogOpen: (isOpen: boolean) => void;
  },
  orderParts: {
    handleOrderSubmit: (selectedPart: Part | null) => void;
  }
) => {
  // Function to handle submitting an order
  const handleOrderSubmit = () => {
    if (partsDialogs.selectedPart) {
      try {
        orderParts.handleOrderSubmit(partsDialogs.selectedPart);
        toast.success("Commande soumise avec succès", {
          description: `Commande pour ${partsDialogs.selectedPart.name} soumise`
        });
      } catch (error) {
        console.error("Erreur lors de la soumission de la commande:", error);
        toast.error("Erreur de commande", {
          description: "Impossible de soumettre la commande. Veuillez réessayer."
        });
      }
    } else {
      toast.error("Aucune pièce sélectionnée", {
        description: "Veuillez sélectionner une pièce avant de commander"
      });
    }
  };

  // Function to open part details
  const openPartDetails = (part: Part) => {
    if (!part) {
      toast.error("Erreur", {
        description: "Impossible d'afficher les détails de cette pièce"
      });
      return;
    }
    
    // Utiliser un délai court pour éviter les problèmes de propagation d'événements
    setTimeout(() => {
      console.log("Ouverture des détails pour la pièce:", part.name);
      partsDialogs.setSelectedPart(part);
      partsDialogs.setIsPartDetailsDialogOpen(true);
    }, 0);
  };

  // Function to open order dialog
  const openOrderDialog = (part: Part) => {
    if (!part) {
      toast.error("Erreur", {
        description: "Impossible de commander cette pièce"
      });
      return;
    }
    
    // Utiliser un délai court pour éviter les problèmes de propagation d'événements
    setTimeout(() => {
      console.log("Ouverture du dialogue de commande pour:", part.name);
      partsDialogs.setSelectedPart(part);
      partsDialogs.setIsOrderDialogOpen(true);
    }, 0);
  };

  return {
    handleOrderSubmit,
    openPartDetails,
    openOrderDialog
  };
};
