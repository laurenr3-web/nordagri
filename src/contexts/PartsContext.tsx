
import React, { createContext, useContext } from 'react';
import { partsData } from '@/data/partsData';
import { useParts } from '@/hooks/useParts';
import { Part } from '@/types/Part';
import { LocalPart, convertToLocalPart } from '@/utils/partTypeConverters';

interface PartsContextType {
  partsHookData: ReturnType<typeof useParts>;
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
    console.error("usePartsContext called outside of a PartsContextProvider - check component hierarchy");
    throw new Error('usePartsContext must be used within a PartsContextProvider');
  }
  return context;
};

export const PartsContextProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  console.log("PartsContextProvider rendering");
  
  // The main hook now provides a cleaner interface with more focused sub-hooks
  const partsHookData = useParts(partsData);
  const [orderNote, setOrderNote] = React.useState('');
  const [isPhotoModalOpen, setIsPhotoModalOpen] = React.useState(false);
  const [isIdentifying, setIsIdentifying] = React.useState(false);
  const [partNumber, setPartNumber] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('inventory');

  // Debug logging for parts data updates
  React.useEffect(() => {
    console.log("Données parts mises à jour:", partsHookData.parts);
  }, [partsHookData.parts]);
  
  // Debug logging for dialog states
  React.useEffect(() => {
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
    import('@/services/openai/partVisionService').then(async ({ identifyPartFromImage }) => {
      try {
        const result = await identifyPartFromImage(imageData);
        
        // Si on a une référence, la mettre dans le champ de recherche
        if (result.referenceNumber) {
          setPartNumber(result.referenceNumber);
          
          // Lancer la recherche automatiquement
          handleSearch(result.referenceNumber);
          
          import('sonner').then(({ toast }) => {
            toast.success(`Pièce identifiée: ${result.probableName}`, {
              description: `Référence: ${result.referenceNumber}`
            });
          });
        } else {
          // Sinon, afficher les informations disponibles
          import('sonner').then(({ toast }) => {
            toast.info(`Type de pièce identifié: ${result.probableName}`, {
              description: "Aucune référence précise n'a pu être détectée."
            });
          });
          
          // Mettre une description générique dans le champ de recherche
          setPartNumber(`${result.probableName} ${result.manufacturer || ''}`);
          handleSearch(`${result.probableName} ${result.manufacturer || ''}`);
        }
      } catch (error) {
        console.error("Erreur d'identification:", error);
        import('sonner').then(({ toast }) => {
          toast.error("Impossible d'identifier la pièce", {
            description: "Essayez avec une photo plus claire ou de meilleure qualité."
          });
        });
      } finally {
        setIsIdentifying(false);
      }
    });
  };

  // Conversion du selectedPart pour éviter les problèmes de type
  const selectedPartAsLocalPart = partsHookData.selectedPart 
    ? (convertToLocalPart(partsHookData.selectedPart) as LocalPart) 
    : null;

  // Ajout d'un log pour déboguer l'état de selectedPart
  React.useEffect(() => {
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
