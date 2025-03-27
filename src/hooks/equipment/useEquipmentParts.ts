
import { useState, useEffect } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';
import { getPartsForEquipment } from '@/services/supabase/parts';

export function useEquipmentParts(equipment: Equipment) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        // Charger les pièces associées à cet équipement
        const equipmentParts = await getPartsForEquipment(equipment.id);
        setParts(equipmentParts);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching parts:', err);
        setError(err.message || 'Impossible de charger les pièces');
      } finally {
        setLoading(false);
      }
    };

    fetchParts();
  }, [equipment.id]);

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
    // Mettre à jour l'état local avec la pièce mise à jour
    setParts(prevParts => 
      prevParts.map(part => 
        part.id === updatedPart.id ? updatedPart : part
      )
    );
    setIsEditDialogOpen(false);
    setSelectedPart(null);
  };

  const handleAddPart = () => {
    // To be implemented when adding parts functionality is needed
    console.log('Add part clicked');
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
    handleAddPart
  };
}
