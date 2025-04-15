
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTimeEntryDataFetching() {
  const [equipments, setEquipments] = useState<Array<{ id: number; name: string }>>([]);
  const [interventions, setInterventions] = useState<Array<{ id: number; title: string }>>([]);
  const [locations, setLocations] = useState<Array<{ id: number; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInterventions = async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('id, title')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setInterventions(data || []);
    } catch (error) {
      console.error("Error loading interventions:", error);
      setInterventions([]);
    }
  };

  const fetchLocations = async () => {
    try {
      // For now, just use a hardcoded list of locations
      // In the future, this could come from the database
      const locations = [
        { id: 1, name: "Atelier" },
        { id: 2, name: "Champ Nord" },
        { id: 3, name: "Champ Sud" },
        { id: 4, name: "Hangar" },
        { id: 5, name: "Serre" }
      ];
      setLocations(locations);
    } catch (error) {
      console.error("Error loading locations:", error);
      setLocations([]);
    }
  };

  return {
    equipments,
    interventions,
    locations,
    loading,
    fetchEquipments,
    fetchInterventions,
    fetchLocations
  };
}
