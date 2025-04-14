
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Equipment, EquipmentStatus } from '@/types/models/equipment';
import { supabase } from '@/integrations/supabase/client';
import { validateEquipmentStatus } from '@/utils/typeGuards';

interface DashboardEquipmentItem extends Equipment {
  usage: {
    hours: number;
    target: number;
  };
  nextService: {
    type: string;
    due: string;
  };
  nextMaintenance: string;
}

/**
 * Hook for fetching and managing equipment data
 */
export const useEquipmentData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState<DashboardEquipmentItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEquipment();
  }, [user]);

  /**
   * Set mock data for demonstration purposes
   */
  const setMockData = () => {
    const mockData: DashboardEquipmentItem[] = [
      {
        id: 1,
        name: 'John Deere 8R 410',
        type: 'Tractor',
        image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
        status: 'operational',
        usage: {
          hours: 342,
          target: 500
        },
        nextService: {
          type: 'Filter Change',
          due: 'In 3 weeks'
        },
        nextMaintenance: 'In 3 weeks'
      },
      {
        id: 2,
        name: 'Case IH Axial-Flow',
        type: 'Combine Harvester',
        image: 'https://images.unsplash.com/photo-1599033329459-cc8c31c7eb6c?q=80&w=500&auto=format&fit=crop',
        status: 'maintenance',
        usage: {
          hours: 480,
          target: 500
        },
        nextService: {
          type: 'Full Service',
          due: 'In 2 days'
        },
        nextMaintenance: 'In 2 days'
      },
      {
        id: 3,
        name: 'Kubota M7-172',
        type: 'Tractor',
        image: 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
        status: 'repair',
        usage: {
          hours: 620,
          target: 500
        },
        nextService: {
          type: 'Engine Check',
          due: 'Overdue'
        },
        nextMaintenance: 'Overdue'
      }
    ];
    setEquipmentData(mockData);
    setLoading(false);
  };

  /**
   * Fetch equipment data from the database
   */
  const fetchEquipment = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch equipment data from Supabase
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) throw error;

      // Filter out any invalid or deleted equipment entries
      const validData = data?.filter(item => 
        item && item.id && item.name
      ) || [];

      if (validData.length > 0) {
        // Map the data to the expected format
        const mappedData: DashboardEquipmentItem[] = validData.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'Unknown',
          image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
          status: validateEquipmentStatus(item.status),
          usage: {
            hours: 342,
            target: 500
          },
          nextService: {
            type: 'Maintenance',
            due: 'In 2 weeks'
          },
          nextMaintenance: 'In 2 weeks'
        }));
        
        setEquipmentData(mappedData);
      } else {
        console.log("No valid equipment data found, using demo data");
        setMockData();
      }
    } catch (error: any) {
      console.error("Error fetching equipment:", error);
      setError(error.message || "Failed to fetch equipment data");
      
      toast({
        title: "Error",
        description: "Failed to fetch equipment data. Using sample data for demonstration.",
        variant: "destructive",
      });
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    equipmentData,
    error,
    refresh: fetchEquipment
  };
};

// Re-export types for consumers
export type { DashboardEquipmentItem };
