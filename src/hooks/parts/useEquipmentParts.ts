
import { useState, useEffect } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';
import { getPartsForEquipment } from '@/services/supabase/parts';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatePart, useDeletePart } from '@/hooks/parts';
import { partsData } from '@/data/partsData';
import { toast as sonnerToast } from 'sonner';

export function useEquipmentParts(equipmentId: string | number | undefined) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsUsingDemoData(false);
        
        if (!equipmentId) {
          setParts([]);
          return;
        }
        
        console.log('Fetching parts for equipment ID:', equipmentId);
        // Charger les pièces associées à cet équipement
        const equipmentParts = await getPartsForEquipment(equipmentId);
        console.log('Fetched parts:', equipmentParts);
        
        // Vérifier si nous utilisons des données de démo
        if (equipmentParts.length > 0 && equipmentParts[0] === partsData[0]) {
          setIsUsingDemoData(true);
        }
        
        setParts(equipmentParts);
      } catch (err: any) {
        console.error('Error fetching parts:', err);
        setError(err.message || 'Impossible de charger les pièces');
        setIsUsingDemoData(true);
        sonnerToast.error("Erreur de chargement", {
          description: "Utilisation des données de démonstration"
        });
        // Utiliser des données de démonstration en cas d'erreur
        const filteredMockData = partsData.filter((part, index) => index % 2 === 0);
        setParts(filteredMockData);
      } finally {
        setLoading(false);
      }
    };

    if (equipmentId) {
      fetchParts();
    } else {
      setLoading(false);
      setParts([]);
    }
  }, [equipmentId]);

  // Filtrer les pièces en fonction du terme de recherche
  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (part.partNumber && part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (part.category && part.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsEditDialogOpen(true);
  };

  const handlePartUpdated = (updatedPart: Part) => {
    try {
      // Utiliser la mutation pour mettre à jour la pièce dans la base de données
      updatePartMutation.mutate(updatedPart, {
        onSuccess: (result) => {
          // Mettre à jour l'état local avec la pièce mise à jour
          setParts(prevParts => 
            prevParts.map(part => 
              part.id === result.id ? result : part
            )
          );
          
          setIsEditDialogOpen(false);
          setSelectedPart(null);
          
          // Invalider les requêtes pour rafraîchir les données
          queryClient.invalidateQueries({ queryKey: ['parts'] });
          
          sonnerToast.success("Pièce mise à jour", {
            description: `La pièce ${result.name} a été mise à jour avec succès`
          });
        },
        onError: (error: any) => {
          console.error('Erreur lors de la mise à jour de la pièce:', error);
          sonnerToast.error("Erreur", {
            description: error.message || "Erreur lors de la mise à jour de la pièce"
          });
        }
      });
    } catch (err: any) {
      console.error('Erreur inattendue lors de la mise à jour:', err);
      sonnerToast.error("Erreur", {
        description: err.message || "Une erreur est survenue lors de la mise à jour"
      });
    }
  };

  const handleDeletePart = async (partId: number | string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pièce?')) {
      return;
    }
    
    try {
      await deletePartMutation.mutateAsync(partId);
      
      // Mise à jour de l'état local après suppression
      setParts(prevParts => prevParts.filter(part => part.id !== partId));
      
      // Invalider les requêtes pour rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      sonnerToast.success("Pièce supprimée", {
        description: "La pièce a été supprimée avec succès"
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      sonnerToast.error("Erreur", {
        description: err.message || "Erreur lors de la suppression de la pièce"
      });
    }
  };

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
  };
  
  const debugPartData = () => {
    console.log('==== DEBUG: PARTS DATA ====');
    console.log('Equipment ID:', equipmentId);
    console.log('Parts count:', parts.length);
    console.log('Using demo data:', isUsingDemoData);
    console.log('Parts array:', parts);
    console.log('========================');
    
    sonnerToast.info("Débogage", {
      description: `${parts.length} pièces dans la console`
    });
  };

  return {
    parts: filteredParts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPart,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isAddPartDialogOpen,
    setIsAddPartDialogOpen,
    handleEditPart,
    handlePartUpdated,
    handleDeletePart,
    handleAddPart,
    isUpdating: updatePartMutation.isPending,
    isUsingDemoData,
    debugPartData
  };
}
