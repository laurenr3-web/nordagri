
import { useState, useEffect } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';
import { getPartsForEquipment, deletePart } from '@/services/supabase/parts';
import { useUpdatePart, useDeletePart } from '@/hooks/parts';
import { useToast } from '@/hooks/use-toast';

export function useEquipmentParts(equipment: Equipment) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const updatePartMutation = useUpdatePart();
  const deletePartMutation = useDeletePart();

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Charger les pièces associées à cet équipement
        const equipmentParts = await getPartsForEquipment(equipment.id);
        setParts(equipmentParts);
      } catch (err: any) {
        console.error('Error fetching parts:', err);
        setError(err.message || 'Impossible de charger les pièces');
        toast({
          title: "Erreur de chargement",
          description: err.message || 'Impossible de charger les pièces compatibles',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [equipment.id, toast]);

  // Filtrer les pièces en fonction du terme de recherche
  const filteredParts = parts.filter(part => 
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.category.toLowerCase().includes(searchTerm.toLowerCase())
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
          
          toast({
            title: "Succès",
            description: `La pièce ${result.name} a été mise à jour avec succès`,
          });
        },
        onError: (error: any) => {
          console.error('Erreur lors de la mise à jour de la pièce:', error);
          toast({
            title: "Erreur",
            description: error.message || "Erreur lors de la mise à jour de la pièce",
            variant: "destructive",
          });
        }
      });
    } catch (err: any) {
      console.error('Erreur inattendue lors de la mise à jour:', err);
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la mise à jour",
        variant: "destructive",
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
      
      toast({
        title: "Succès",
        description: "La pièce a été supprimée avec succès",
      });
    } catch (err: any) {
      console.error('Erreur lors de la suppression:', err);
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de la suppression de la pièce",
        variant: "destructive",
      });
    }
  };

  const handleAddPart = () => {
    setIsAddPartDialogOpen(true);
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
    isUpdating: updatePartMutation.isPending
  };
}
