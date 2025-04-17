
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useTimeTrackingEquipment() {
  const [equipments, setEquipments] = useState<{ id: number; name: string }[]>([]);

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
