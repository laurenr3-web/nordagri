
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter } from '@/services/supabase/equipment/types';

export interface EquipmentTableData {
  equipment: Equipment[];
  loading: boolean;
  error: Error | null;
  filter: EquipmentFilter;
  totalCount: number;
  setFilter: (filter: EquipmentFilter) => void;
  refreshEquipment: () => Promise<void>;
  addEquipment: (equipment: Omit<Equipment, 'id'>) => Promise<boolean>;
  updateEquipment: (id: number, updates: Partial<Equipment>) => Promise<boolean>;
  deleteEquipment: (id: number) => Promise<boolean>;
  bulkAddEquipment: (equipmentArray: Omit<Equipment, 'id'>[]) => Promise<boolean>;
}

export function useEquipmentTable(initialFilter: EquipmentFilter = {}): EquipmentTableData {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<EquipmentFilter>(initialFilter);
  const [totalCount, setTotalCount] = useState(0);
  
  // Fetch equipment data
  useEffect(() => {
    fetchEquipment();
  }, [filter]);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build the query based on filters
      let query = supabase.from('equipment').select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (filter.search) {
        query = query.or(`name.ilike.%${filter.search}%,model.ilike.%${filter.search}%,type.ilike.%${filter.search}%`);
      }
      
      if (filter.status && filter.status.length > 0) {
        query = query.in('status', filter.status);
      }
      
      if (filter.type && filter.type.length > 0) {
        query = query.in('type', filter.type);
      }
      
      const { data, error, count } = await query.order('name');
      
      if (error) {
        throw new Error(error.message);
      }
      
      setEquipment(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
        toast.error(`Erreur lors de la récupération des équipements: ${err.message}`);
      } else {
        setError(new Error('Une erreur inconnue est survenue'));
        toast.error('Erreur lors de la récupération des équipements');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const addEquipment = async (equipmentData: Omit<Equipment, 'id'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipment(prev => [...prev, data]);
      toast.success('Équipement ajouté avec succès');
      return true;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Erreur lors de l'ajout de l'équipement: ${err.message}`);
      } else {
        toast.error('Erreur lors de l\'ajout de l\'équipement');
      }
      return false;
    }
  };
  
  const updateEquipment = async (id: number, updates: Partial<Equipment>): Promise<boolean> => {
    try {
      // Make sure dates are properly formatted for Supabase
      const formattedUpdates = { ...updates };
      if (updates.purchase_date && updates.purchase_date instanceof Date) {
        formattedUpdates.purchase_date = updates.purchase_date.toISOString();
      }
      
      const { data, error } = await supabase
        .from('equipment')
        .update(formattedUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipment(prev => prev.map(item => item.id === id ? data : item));
      toast.success('Équipement mis à jour avec succès');
      return true;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Erreur lors de la mise à jour de l'équipement: ${err.message}`);
      } else {
        toast.error('Erreur lors de la mise à jour de l\'équipement');
      }
      return false;
    }
  };
  
  const deleteEquipment = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipment(prev => prev.filter(item => item.id !== id));
      toast.success('Équipement supprimé avec succès');
      return true;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Erreur lors de la suppression de l'équipement: ${err.message}`);
      } else {
        toast.error('Erreur lors de la suppression de l\'équipement');
      }
      return false;
    }
  };
  
  const bulkAddEquipment = async (equipmentArray: Omit<Equipment, 'id'>[]): Promise<boolean> => {
    try {
      // Format dates for each equipment item
      const formattedData = equipmentArray.map(item => {
        const formattedItem = { ...item };
        if (item.purchase_date && item.purchase_date instanceof Date) {
          formattedItem.purchase_date = item.purchase_date.toISOString();
        }
        return formattedItem;
      });
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(formattedData)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipment(prev => [...prev, ...data]);
      toast.success(`${data.length} équipements ajoutés avec succès`);
      return true;
    } catch (err) {
      if (err instanceof Error) {
        toast.error(`Erreur lors de l'ajout des équipements: ${err.message}`);
      } else {
        toast.error('Erreur lors de l\'ajout des équipements');
      }
      return false;
    }
  };
  
  const refreshEquipment = async () => {
    await fetchEquipment();
  };
  
  return {
    equipment,
    loading,
    error,
    filter,
    totalCount,
    setFilter,
    refreshEquipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    bulkAddEquipment
  };
}

export type { Equipment } from '@/services/supabase/equipment/types';
