
import { useState, useEffect } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';
import { getPartsForEquipment } from '@/services/supabase/parts';
import { useUpdatePart } from '@/hooks/parts';
import { useToast } from '@/hooks/use-toast';

export function useEquipmentParts(equipment: Equipment) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const updatePartMutation = useUpdatePart();

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Load parts associated with this equipment
        // Convert id to string to ensure it works with Supabase's interface
        const equipmentParts = await getPartsForEquipment(equipment.id.toString());
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

  // Filter parts based on search term
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
        },
        onError: (error: any) => {
          // L'erreur est déjà gérée par le hook useUpdatePart
          console.error('Erreur lors de la mise à jour de la pièce:', error);
          // Ne pas fermer le dialogue pour permettre à l'utilisateur de corriger l'erreur
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

  const handleAddPart = () => {
    // To be implemented when adding parts functionality is needed
    console.log('Add part clicked');
    toast({
      title: "Information",
      description: "La fonctionnalité d'ajout de pièce n'est pas encore implémentée.",
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
    handleEditPart,
    handlePartUpdated,
    handleAddPart,
    isUpdating: updatePartMutation.isPending
  };
}
