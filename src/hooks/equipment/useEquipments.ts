
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/services/supabase/equipment/types';
import { cacheEquipments, getCachedEquipments } from '@/services/cache/equipmentCacheService';
import { useNetworkState } from '@/hooks/useNetworkState';

export interface EquipmentOption {
  id: number;
  name: string;
  value: string; // ID en tant que string pour la compatibilité avec les composants UI
  label: string; // Nom de l'équipement
}

export function useEquipments() {
  const isOnline = useNetworkState();

  return useQuery({
    queryKey: ['equipments'],
    queryFn: async (): Promise<EquipmentOption[]> => {
      try {
        // Si l'utilisateur est hors ligne, essayer d'utiliser le cache
        if (!isOnline) {
          const cachedData = getCachedEquipments();
          if (cachedData) {
            console.log('Utilisation des données en cache pour les équipements');
            return cachedData;
          }
        }

        // Récupérer les données depuis Supabase
        const { data: equipments, error } = await supabase
          .from('equipment')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        console.log('Raw equipment data:', equipments);
        
        // Conversion des équipements au format attendu par le composant MultiSelect
        const formattedEquipments = equipments.map((equipment: any) => ({
          id: equipment.id,
          name: equipment.name,
          value: equipment.id.toString(),
          label: equipment.name
        }));
        
        console.log('Formatted equipment options:', formattedEquipments);
        
        // Mettre en cache les données pour une utilisation hors ligne
        cacheEquipments(formattedEquipments);
        
        return formattedEquipments;
      } catch (error) {
        console.error('Erreur lors du chargement des équipements:', error);
        
        // En cas d'erreur, essayer d'utiliser le cache
        const cachedData = getCachedEquipments();
        if (cachedData) {
          console.log('Utilisation des données en cache après erreur');
          return cachedData;
        }
        
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 heure (remplace cacheTime qui est déprécié)
  });
}

// Validation des équipements compatibles
export function useValidateCompatibility() {
  const isOnline = useNetworkState();

  return useQuery({
    queryKey: ['equipments-validation'],
    queryFn: async (): Promise<Set<number>> => {
      try {
        // Si l'utilisateur est hors ligne, essayer d'utiliser le cache
        if (!isOnline) {
          const cachedData = getCachedEquipments();
          if (cachedData) {
            console.log('Utilisation des données en cache pour la validation');
            return new Set(cachedData.map(eq => parseInt(eq.value)));
          }
        }
        
        const { data: equipments, error } = await supabase
          .from('equipment')
          .select('id');

        if (error) throw error;
        
        console.log('Equipment IDs for validation:', equipments);
        
        // Créer un Set pour une recherche rapide O(1)
        const validIds = new Set(equipments.map((eq: any) => eq.id));
        console.log('Valid equipment IDs set:', Array.from(validIds));
        
        return validIds;
      } catch (error) {
        console.error('Erreur lors de la validation des équipements:', error);
        
        // En cas d'erreur, essayer d'utiliser le cache pour la validation
        const cachedData = getCachedEquipments();
        if (cachedData) {
          console.log('Utilisation des données en cache pour la validation après erreur');
          return new Set(cachedData.map(eq => parseInt(eq.value)));
        }
        
        return new Set();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // Remplace cacheTime
  });
}
