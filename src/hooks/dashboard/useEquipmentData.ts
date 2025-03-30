
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  nextMaintenance: string | null;
}

export const useEquipmentData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchEquipment();
    } else {
      setMockData();
    }
  }, [user]);

  const setMockData = () => {
    setEquipmentData([
      { id: 1, name: 'John Deere 8R 410', type: 'Tractor', status: 'operational', nextMaintenance: 'In 3 weeks' },
      { id: 2, name: 'Case IH Axial-Flow', type: 'Combine Harvester', status: 'maintenance', nextMaintenance: 'In 2 days' },
      { id: 3, name: 'Kubota M7-172', type: 'Tractor', status: 'repair', nextMaintenance: 'Overdue' }
    ]);
    setLoading(false);
  };

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, type, status')
        .eq('owner_id', user?.id)
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match the EquipmentItem type
        const mappedEquipment: EquipmentItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'Unknown',
          status: item.status || 'operational',
          nextMaintenance: null // We'll calculate this separately
        }));
        setEquipmentData(mappedEquipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
      toast({
        title: "Error",
        description: "Failed to fetch equipment data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    equipmentData,
    fetchEquipment
  };
};
