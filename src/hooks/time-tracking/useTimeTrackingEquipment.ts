
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook pour récupérer la liste des équipements disponibles pour le suivi du temps
 * 
 * Charge la liste des équipements depuis Supabase pour permettre
 * leur association aux entrées de suivi du temps.
 * 
 * @returns {Object} Liste des équipements disponibles
 */
export function useTimeTrackingEquipment() {
  const [equipments, setEquipments] = useState<{ id: number; name: string }[]>([]);

  /**
   * Récupère la liste des équipements depuis Supabase
   */
  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return { equipments };
}
