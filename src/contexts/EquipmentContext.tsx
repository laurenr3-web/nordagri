
import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Equipment, EquipmentFilter } from '@/types/Equipment';
import { useStandardQuery, useStandardMutation } from '@/hooks/useStandardQuery';
import { equipmentService } from '@/services/api/equipmentService';

// Interface pour le contexte d'équipement
interface EquipmentContextType {
  // État
  equipment: Equipment[];
  selectedEquipment: Equipment | null;
  isLoading: boolean;
  isError: boolean;
  
  // Filtres
  filters: EquipmentFilter;
  setFilters: (filters: EquipmentFilter) => void;
  
  // Actions
  selectEquipment: (id: number) => void;
  refreshEquipment: () => void;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<Equipment>;
  updateEquipment: (equipment: Equipment) => Promise<Equipment>;
  deleteEquipment: (id: number) => Promise<void>;
  clearSelection: () => void;
}

// Interface pour les props du provider
interface EquipmentProviderProps {
  children: ReactNode;
  initialFilters?: EquipmentFilter;
}

// Création du contexte
const EquipmentContext = createContext<EquipmentContextType | null>(null);

/**
 * Provider pour le contexte d'équipement
 * Centralise la logique de gestion des équipements
 */
export const EquipmentProvider: React.FC<EquipmentProviderProps> = ({ 
  children,
  initialFilters = {}
}) => {
  // État local
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState<EquipmentFilter>(initialFilters);
  
  // Requête pour charger les équipements
  const { 
    data: equipment = [], 
    isLoading, 
    isError,
    refetch 
  } = useStandardQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentService.getEquipment(filters),
  });
  
  // Mutation pour ajouter un équipement
  const addMutation = useStandardMutation({
    mutationFn: equipmentService.createEquipment,
    invalidateQueries: [['equipment']],
    successMessage: 'Équipement ajouté avec succès',
    errorMessage: 'Erreur lors de l\'ajout de l\'équipement'
  });
  
  // Mutation pour mettre à jour un équipement
  const updateMutation = useStandardMutation({
    mutationFn: (data: Equipment) => equipmentService.updateEquipment(data.id, data),
    invalidateQueries: [['equipment']],
    successMessage: 'Équipement mis à jour avec succès',
    errorMessage: 'Erreur lors de la mise à jour de l\'équipement'
  });
  
  // Mutation pour supprimer un équipement
  const deleteMutation = useStandardMutation({
    mutationFn: equipmentService.deleteEquipment,
    invalidateQueries: [['equipment']],
    successMessage: 'Équipement supprimé avec succès',
    errorMessage: 'Erreur lors de la suppression de l\'équipement'
  });
  
  // Mémoisation de l'équipement sélectionné
  const selectedEquipment = useMemo(() => 
    equipment.find(item => item.id === selectedId) || null, 
    [equipment, selectedId]
  );
  
  // Actions
  const selectEquipment = useCallback((id: number) => {
    setSelectedId(id);
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedId(null);
  }, []);
  
  const refreshEquipment = useCallback(() => {
    refetch();
  }, [refetch]);
  
  // Méthodes d'API enveloppées
  const addEquipment = useCallback(async (data: Omit<Equipment, 'id'>) => {
    return addMutation.mutateAsync(data);
  }, [addMutation]);
  
  const updateEquipment = useCallback(async (data: Equipment) => {
    return updateMutation.mutateAsync(data);
  }, [updateMutation]);
  
  const deleteEquipment = useCallback(async (id: number) => {
    await deleteMutation.mutateAsync(id);
    if (selectedId === id) {
      clearSelection();
    }
  }, [deleteMutation, selectedId, clearSelection]);
  
  // Valeur du contexte
  const contextValue = useMemo<EquipmentContextType>(() => ({
    equipment,
    selectedEquipment,
    isLoading,
    isError,
    filters,
    setFilters,
    selectEquipment,
    refreshEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    clearSelection
  }), [
    equipment,
    selectedEquipment,
    isLoading,
    isError,
    filters,
    selectEquipment,
    refreshEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    clearSelection
  ]);
  
  return (
    <EquipmentContext.Provider value={contextValue}>
      {children}
    </EquipmentContext.Provider>
  );
};

/**
 * Hook pour utiliser le contexte d'équipement
 */
export const useEquipment = (): EquipmentContextType => {
  const context = useContext(EquipmentContext);
  
  if (!context) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  
  return context;
};
