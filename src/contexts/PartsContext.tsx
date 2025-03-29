
import React, { createContext, useContext, useEffect, useState } from 'react';
import { partsData } from '@/data/partsData';
import { useEmergencyParts } from '@/hooks/emergencyPartsHook';
import { Part } from '@/types/Part';
import { LocalPart, convertToLocalPart } from '@/utils/partTypeConverters';
import { toast } from 'sonner';

interface PartsContextType {
  partsHookData: ReturnType<typeof useEmergencyParts>;
  selectedPartAsLocalPart: LocalPart | null;
  orderNote: string;
  setOrderNote: (note: string) => void;
  partNumber: string;
  setPartNumber: (number: string) => void;
  isPhotoModalOpen: boolean;
  setIsPhotoModalOpen: (isOpen: boolean) => void;
  isIdentifying: boolean;
  setIsIdentifying: (isIdentifying: boolean) => void;
  handleAddPartFromSearch: (part: Part) => void;
  handleSearch: (searchText: string) => void;
  handlePhotoTaken: (imageData: string) => Promise<void>;
}

// Create the context with a meaningful undefined check
const PartsContext = createContext<PartsContextType | undefined>(undefined);

// Add better error messaging to the hook
export const usePartsContext = () => {
  const context = useContext(PartsContext);
  if (!context) {
    // Log detailed error information
    console.error(
      "usePartsContext called outside of a PartsContextProvider - check component hierarchy",
      new Error().stack
    );
    toast.error("Context error", {
      description: "Parts data unavailable - please refresh the page"
    });
    throw new Error('usePartsContext must be used within a PartsContextProvider');
  }
  return context;
};

export const PartsContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Debug logs for mounting/unmounting
  useEffect(() => {
    console.log("PartsContextProvider mounted");
    return () => {
      console.log("PartsContextProvider unmounted");
    };
  }, []);
  
  console.log("PartsContextProvider rendering");
  
  // All hooks declarations at the beginning
  const partsHookData = useEmergencyParts();
  const [orderNote, setOrderNote] = useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [partNumber, setPartNumber] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');

  // Debug logging for parts data updates
  useEffect(() => {
    console.log("Données parts mises à jour:", partsHookData.parts);
  }, [partsHookData.parts]);
  
  // Debug logging for dialog states
  useEffect(() => {
    console.log("États dialogues:", {
      isPartDetailsDialogOpen: partsHookData.isPartDetailsDialogOpen,
      isAddPartDialogOpen: partsHookData.isAddPartDialogOpen,
      isFilterDialogOpen: partsHookData.isFilterDialogOpen,
      isSortDialogOpen: partsHookData.isSortDialogOpen,
      selectedPart: partsHookData.selectedPart?.name
    });
  }, [
    partsHookData.isPartDetailsDialogOpen,
    partsHookData.isAddPartDialogOpen,
    partsHookData.isFilterDialogOpen,
    partsHookData.isSortDialogOpen,
    partsHookData.selectedPart
  ]);

  const handleAddPartFromSearch = (part: Part) => {
    // Pré-traiter la pièce avant de l'ajouter à l'inventaire
    const newPart = {
      ...part,
      inStock: true,
      stock: part.stock || 1, // Ensure stock field is populated
      reorderPoint: part.reorderPoint || 1, // Ensure reorderPoint is populated
      isFromSearch: true // Flag it as coming from search
    };
    
    partsHookData.handleAddPart(newPart);
  };

  const handleSearch = (searchText: string) => {
    partsHookData.setSearchTerm(searchText);
    // Si on est dans l'onglet recherche, passer à l'onglet inventaire
    if (activeTab === 'search') {
      setActiveTab('inventory');
    }
  };

  const handlePhotoTaken = async (imageData: string) => {
    setIsIdentifying(true);
    try {
      const { identifyPartFromImage } = await import('@/services/openai/partVisionService');
      try {
        const result = await identifyPartFromImage(imageData);
        
        // Si on a une référence, la mettre dans le champ de recherche
        if (result.referenceNumber) {
          setPartNumber(result.referenceNumber);
          
          // Lancer la recherche automatiquement
          handleSearch(result.referenceNumber);
          
          const { toast } = await import('sonner');
          toast.success(`Pièce identifiée: ${result.probableName}`, {
            description: `Référence: ${result.referenceNumber}`
          });
        } else {
          // Sinon, afficher les informations disponibles
          const { toast } = await import('sonner');
          toast.info(`Type de pièce identifié: ${result.probableName}`, {
            description: "Aucune référence précise n'a pu être détectée."
          });
          
          // Mettre une description générique dans le champ de recherche
          setPartNumber(`${result.probableName} ${result.manufacturer || ''}`);
          handleSearch(`${result.probableName} ${result.manufacturer || ''}`);
        }
      } catch (error) {
        console.error("Erreur d'identification:", error);
        const { toast } = await import('sonner');
        toast.error("Impossible d'identifier la pièce", {
          description: "Essayez avec une photo plus claire ou de meilleure qualité."
        });
      } 
    } catch (error) {
      console.error("Erreur au chargement du module d'identification:", error);
    } finally {
      setIsIdentifying(false);
    }
  };

  // Conversion du selectedPart pour éviter les problèmes de type
  const selectedPartAsLocalPart = partsHookData.selectedPart 
    ? (convertToLocalPart(partsHookData.selectedPart) as LocalPart) 
    : null;

  // Ajout d'un log pour déboguer l'état de selectedPart
  useEffect(() => {
    console.log("Parts: selectedPart mis à jour:", partsHookData.selectedPart?.name);
  }, [partsHookData.selectedPart]);

  const value = {
    partsHookData,
    selectedPartAsLocalPart,
    orderNote,
    setOrderNote,
    partNumber,
    setPartNumber,
    isPhotoModalOpen,
    setIsPhotoModalOpen,
    isIdentifying,
    setIsIdentifying,
    handleAddPartFromSearch,
    handleSearch,
    handlePhotoTaken
  };

  console.log("PartsContextProvider providing context");
  
  return (
    <PartsContext.Provider value={value}>
      {children}
    </PartsContext.Provider>
  );
};
