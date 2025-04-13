
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

// Define Equipment type for use throughout the application
export interface Equipment {
  id: number;
  name: string;
  type?: string;
  category?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  location?: string;
  purchase_date?: string | Date;
  status?: string;
  notes?: string;
  image?: string;
  year?: number;
  serialNumber?: string;
}

// CRUD operation for equipment
export const deleteEquipment = async (id: string | number): Promise<void> => {
  try {
    // Convert id to number if it's a string
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    await supabase.from('equipment').delete().eq('id', numericId);
    toast.success("Équipement supprimé avec succès");
  } catch (error: any) {
    console.error('Error deleting equipment:', error);
    toast.error("Erreur lors de la suppression de l'équipement");
    throw error;
  }
};

export const createMaintenancePlan = async (equipmentId: string | number, plan: any): Promise<void> => {
  try {
    // Convert equipmentId to number if it's a string
    const numericId = typeof equipmentId === 'string' ? parseInt(equipmentId, 10) : equipmentId;
    
    const planData = {
      ...plan,
      equipment_id: numericId
    };
    
    await supabase.from('maintenance_plans').insert(planData);
    toast.success("Plan de maintenance créé avec succès");
  } catch (error: any) {
    console.error('Error creating maintenance plan:', error);
    toast.error("Erreur lors de la création du plan de maintenance");
    throw error;
  }
};

// Main hook for equipment table functionality
export const useEquipmentTable = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<any>([]);
  const [total, setTotal] = useState(0);

  // Fetch equipments from Supabase
  const fetchEquipments = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('equipment').select('*', { count: 'exact' });

      // Apply sorting if exists
      if (sorting && sorting.length > 0) {
        const { id, desc } = sorting[0];
        query = query.order(id, { ascending: !desc });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      const from = pageIndex * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setEquipments(data || []);
      if (count) {
        setTotal(count);
        setPageCount(Math.ceil(count / pageSize));
      }
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      toast.error("Erreur lors du chargement des équipements");
    } finally {
      setIsLoading(false);
    }
  }, [pageIndex, pageSize, sorting]);

  // Create equipment
  const createEquipment = async (data: Omit<Equipment, 'id'>) => {
    try {
      const { error } = await supabase.from('equipment').insert([data]);
      if (error) throw error;
      toast.success("Équipement ajouté avec succès");
      fetchEquipments();
      return true;
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error("Erreur lors de l'ajout de l'équipement");
      return false;
    }
  };

  // Update equipment
  const updateEquipment = async (id: number, data: Partial<Equipment>) => {
    try {
      const { error } = await supabase.from('equipment').update(data).eq('id', id);
      if (error) throw error;
      toast.success("Équipement mis à jour avec succès");
      fetchEquipments();
      return true;
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error("Erreur lors de la mise à jour de l'équipement");
      return false;
    }
  };

  // Import multiple equipment
  const importEquipments = async (equipments: Omit<Equipment, 'id'>[]) => {
    try {
      const { error } = await supabase.from('equipment').insert(equipments);
      if (error) throw error;
      toast.success(`${equipments.length} équipements importés avec succès`);
      fetchEquipments();
      return true;
    } catch (error) {
      console.error('Error importing equipment:', error);
      toast.error("Erreur lors de l'importation des équipements");
      return false;
    }
  };

  // Load equipments on initial render and when dependencies change
  useEffect(() => {
    fetchEquipments();
  }, [fetchEquipments]);

  return {
    equipments,
    isLoading,
    pageCount,
    pageIndex,
    pageSize,
    total,
    setPageIndex,
    setPageSize,
    setSorting,
    sorting,
    fetchEquipments,
    createEquipment,
    updateEquipment,
    deleteEquipment,
    importEquipments
  };
};
