
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { EquipmentItem } from './types/equipmentTypes';
import { fetchEquipmentData } from './services/equipmentService';

/**
 * Hook for fetching and managing equipment data
 */
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

  /**
   * Set mock data for demonstration purposes
   */
  const setMockData = () => {
    setEquipmentData([
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
    ]);
    setLoading(false);
  };

  /**
   * Fetch equipment data from the database
   */
  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const data = await fetchEquipmentData(user?.id);
      setEquipmentData(data);
    } catch (error) {
      console.error("Error fetching equipment:", error);
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
    fetchEquipment
  };
};

// Re-export types for consumers
export type { EquipmentItem } from './types/equipmentTypes';
