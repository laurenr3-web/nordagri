
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService, Equipment, EquipmentFilter } from '@/services/supabase/equipmentService';
import { useToast } from '@/hooks/use-toast';
import { useOfflineQuery, useOfflineMutation } from '@/hooks/useOfflineQuery';

export function useEquipmentData() {
  const [filters, setFilters] = useState<EquipmentFilter>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Utiliser useOfflineQuery au lieu de useQuery pour le support hors-ligne
  const { 
    data: equipment,
    isLoading,
    isError,
    error,
    refetch,
    isOffline,
    isCached
  } = useOfflineQuery({
    queryKey: ['equipment', filters],
    queryFn: () => equipmentService.getEquipment(filters),
    // Configuration du cache pour le support hors-ligne
    cacheParams: {
      tableName: 'equipment',
      cacheKey: `equipment_list_${JSON.stringify(filters)}`,
      cacheTime: 1000 * 60 * 60 * 24 // 24 heures
    }
  });
  
  // Fetch filter options
  const { 
    data: filterOptions,
    isOffline: filterOptionsOffline,
    isCached: filterOptionsCached 
  } = useOfflineQuery({
    queryKey: ['equipment-filter-options'],
    queryFn: () => equipmentService.getFilterOptions(),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheParams: {
      tableName: 'equipment_options',
      cacheKey: 'equipment_filter_options'
    }
  });
  
  // Fetch equipment stats
  const { 
    data: stats,
    isOffline: statsOffline,
    isCached: statsCached 
  } = useOfflineQuery({
    queryKey: ['equipment-stats'],
    queryFn: () => equipmentService.getEquipmentStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheParams: {
      tableName: 'equipment_stats',
      cacheKey: 'equipment_stats'
    }
  });
  
  // Mutation pour ajouter un équipement avec support hors-ligne
  const addEquipmentMutation = useOfflineMutation(
    (equipment: Omit<Equipment, 'id'>) => {
      console.log('📤 Sending equipment to Supabase:', equipment);
      return equipmentService.addEquipment(equipment);
    },
    {
      onSuccess: (newEquipment) => {
        console.log('✅ Equipment successfully added:', newEquipment);
        
        // Update cache and refetch
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-filter-options'] });
        
        toast({
          title: 'Équipement ajouté',
          description: `${newEquipment.name} a été ajouté avec succès`,
        });
      },
      onError: (error: Error) => {
        console.error('❌ Error adding equipment:', error);
        toast({
          title: 'Erreur',
          description: `Impossible d'ajouter l'équipement: ${error.message}`,
          variant: 'destructive',
        });
      }
    },
    // Configuration de synchronisation pour le support hors-ligne
    {
      tableName: 'equipment',
      operationType: 'create'
    }
  );
  
  // Mutation pour mettre à jour un équipement avec support hors-ligne
  const updateEquipmentMutation = useOfflineMutation(
    (equipment: Equipment) => 
      equipmentService.updateEquipment(equipment),
    {
      onSuccess: (updatedEquipment) => {
        console.log('✅ Equipment successfully updated:', updatedEquipment);
        
        // Update cache and refetch
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment', updatedEquipment.id] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
        
        toast({
          title: 'Équipement mis à jour',
          description: `${updatedEquipment.name} a été mis à jour avec succès`,
        });
      },
      onError: (error: Error) => {
        console.error('❌ Error updating equipment:', error);
        toast({
          title: 'Erreur',
          description: `Impossible de mettre à jour l'équipement: ${error.message}`,
          variant: 'destructive',
        });
      }
    },
    // Configuration de synchronisation pour le support hors-ligne
    {
      tableName: 'equipment',
      operationType: 'update',
      getEntityId: (equipment: Equipment) => equipment.id
    }
  );
  
  // Mutation pour supprimer un équipement avec support hors-ligne
  const deleteEquipmentMutation = useOfflineMutation(
    async (equipmentId: number) => {
      console.log('Attempting to delete equipment:', equipmentId);
      
      try {
        await equipmentService.deleteEquipment(equipmentId);
        return equipmentId; // Retourne l'ID si la suppression a réussi
      } catch (error) {
        console.error(`Detailed error deleting equipment ${equipmentId}:`, error);
        throw error; // Renvoie l'erreur pour être capturée par onError
      }
    },
    {
      onSuccess: (equipmentId) => {
        console.log('✅ Equipment successfully deleted, ID:', equipmentId);
        
        // Update cache by removing the deleted item
        queryClient.setQueryData(['equipment', equipmentId], undefined);
        
        // Force invalidate ALL equipment-related queries
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
        queryClient.invalidateQueries({ queryKey: ['equipment-filter-options'] });
        
        toast({
          title: 'Équipement supprimé',
          description: 'L\'équipement a été supprimé avec succès',
        });
        
        // Force a refetch after a small delay
        setTimeout(() => {
          console.log('Forced refetch after equipment deletion');
          refetch();
          // Force a more aggressive refetch of all equipment
          queryClient.refetchQueries({ queryKey: ['equipment'] });
        }, 500);
      },
      onError: (error: Error) => {
        console.error('❌ Error deleting equipment:', error);
        toast({
          title: 'Erreur',
          description: `Impossible de supprimer l'équipement: ${error.message}`,
          variant: 'destructive',
        });
      }
    },
    // Configuration de synchronisation pour le support hors-ligne
    {
      tableName: 'equipment',
      operationType: 'delete',
      getEntityId: (equipmentId: number) => equipmentId
    }
  );
  
  // Get equipment by ID
  const getEquipmentById = (id: number) => {
    return useOfflineQuery({
      queryKey: ['equipment', id],
      queryFn: () => equipmentService.getEquipmentById(id),
      cacheParams: {
        tableName: 'equipment',
        cacheKey: `equipment_${id}`
      }
    });
  };
  
  // Get maintenance history for an equipment
  const getMaintenanceHistory = (equipmentId: number) => {
    return useOfflineQuery({
      queryKey: ['equipment-maintenance', equipmentId],
      queryFn: () => equipmentService.getEquipmentMaintenanceHistory(equipmentId),
      enabled: !!equipmentId,
      cacheParams: {
        tableName: 'equipment_maintenance',
        cacheKey: `equipment_maintenance_${equipmentId}`
      }
    });
  };
  
  // Search equipment
  const searchEquipment = async (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };
  
  // Update filters
  const updateFilters = (newFilters: Partial<EquipmentFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({});
  };
  
  return {
    equipment,
    filters,
    filterOptions,
    stats,
    isLoading,
    isError,
    error,
    refetch,
    searchEquipment,
    updateFilters,
    resetFilters,
    addEquipment: (equipment: Omit<Equipment, 'id'>) => 
      addEquipmentMutation.mutateAsync(equipment),
    updateEquipment: (equipment: Equipment) => 
      updateEquipmentMutation.mutateAsync(equipment),
    deleteEquipment: (equipmentId: number) => 
      deleteEquipmentMutation.mutateAsync(equipmentId),
    getEquipmentById,
    getMaintenanceHistory,
    isAdding: addEquipmentMutation.isPending,
    isUpdating: updateEquipmentMutation.isPending,
    isDeleting: deleteEquipmentMutation.isPending,
    // Nouvelles propriétés pour le support hors-ligne
    isOffline,
    isCached,
    filterOptionsOffline,
    filterOptionsCached,
    statsOffline,
    statsCached
  };
}
