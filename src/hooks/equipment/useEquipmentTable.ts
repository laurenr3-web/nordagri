
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentStatus, EquipmentDB, mapEquipmentFromDB, mapEquipmentToDB } from '@/types/Equipment';
import { safeStatus } from '@/utils/typeAdapters';

export interface EquipmentTableState {
  equipment: Equipment[];
  loading: boolean;
  error: Error | null;
  filter: EquipmentFilter;
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  sorting: any;
}

export interface EquipmentFilter {
  search?: string;
  status?: EquipmentStatus[];
  type?: string[];
  category?: string[];
}

export function useEquipmentTable(initialFilter: EquipmentFilter = {}) {
  const [state, setState] = useState<EquipmentTableState>({
    equipment: [],
    loading: true,
    error: null,
    filter: initialFilter,
    totalCount: 0,
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    sorting: []
  });
  
  // Fetch equipment data
  useEffect(() => {
    fetchEquipment();
  }, [state.filter, state.pageIndex, state.pageSize, state.sorting]);

  const fetchEquipment = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Build the query based on filters
      let query = supabase.from('equipment').select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (state.filter.search) {
        query = query.or(`name.ilike.%${state.filter.search}%,model.ilike.%${state.filter.search}%,type.ilike.%${state.filter.search}%`);
      }
      
      if (state.filter.status && state.filter.status.length > 0) {
        query = query.in('status', state.filter.status);
      }
      
      if (state.filter.type && state.filter.type.length > 0) {
        query = query.in('type', state.filter.type);
      }
      
      // Add pagination
      const from = state.pageIndex * state.pageSize;
      const to = from + state.pageSize - 1;
      query = query.range(from, to);
      
      // Add sorting
      if (state.sorting && state.sorting.length > 0) {
        state.sorting.forEach((sort: any) => {
          query = query.order(sort.id, { ascending: sort.desc ? false : true });
        });
      } else {
        query = query.order('name');
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Map database equipment to frontend equipment
      const equipmentData: Equipment[] = (data || []).map((item: EquipmentDB) => 
        mapEquipmentFromDB(item)
      );
      
      setState(prev => ({
        ...prev,
        equipment: equipmentData,
        totalCount: count || 0,
        pageCount: Math.ceil((count || 0) / state.pageSize),
        loading: false
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      setState(prev => ({ ...prev, error: new Error(errorMsg), loading: false }));
      toast.error(`Error fetching equipment: ${errorMsg}`);
    }
  };
  
  const addEquipment = async (equipmentData: Omit<Equipment, 'id'>): Promise<boolean> => {
    try {
      // Convert to database format
      const dbEquipment = mapEquipmentToDB(equipmentData);
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(dbEquipment)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Map the returned data back to Equipment type
      const newEquipment = mapEquipmentFromDB(data);
      
      // Update local state
      setState(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment],
        totalCount: prev.totalCount + 1,
        pageCount: Math.ceil((prev.totalCount + 1) / state.pageSize)
      }));
      
      toast.success('Equipment added successfully');
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Error adding equipment: ${errorMsg}`);
      return false;
    }
  };
  
  const updateEquipment = async (id: number, updates: Partial<Equipment>): Promise<boolean> => {
    try {
      // Convert to database format
      const dbUpdates = mapEquipmentToDB(updates);
      
      const { data, error } = await supabase
        .from('equipment')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      // Map the returned data back to Equipment type
      const updatedEquipment = mapEquipmentFromDB(data);
      
      // Update local state
      setState(prev => ({
        ...prev,
        equipment: prev.equipment.map(item => item.id === id ? updatedEquipment : item)
      }));
      
      toast.success('Equipment updated successfully');
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Error updating equipment: ${errorMsg}`);
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
      setState(prev => ({
        ...prev,
        equipment: prev.equipment.filter(item => item.id !== id),
        totalCount: prev.totalCount - 1,
        pageCount: Math.ceil((prev.totalCount - 1) / state.pageSize)
      }));
      
      toast.success('Equipment deleted successfully');
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Error deleting equipment: ${errorMsg}`);
      return false;
    }
  };
  
  const bulkAddEquipment = async (equipmentArray: Omit<Equipment, 'id'>[]): Promise<boolean> => {
    try {
      // Convert to database format
      const dbEquipmentArray = equipmentArray.map(eq => mapEquipmentToDB(eq));
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(dbEquipmentArray)
        .select();
        
      if (error) {
        throw error;
      }
      
      // Map the returned data back to Equipment type
      const newEquipments = data.map((item: EquipmentDB) => mapEquipmentFromDB(item));
      
      // Update local state
      setState(prev => ({
        ...prev,
        equipment: [...prev.equipment, ...newEquipments],
        totalCount: prev.totalCount + newEquipments.length,
        pageCount: Math.ceil((prev.totalCount + newEquipments.length) / state.pageSize)
      }));
      
      toast.success(`${newEquipments.length} equipment added successfully`);
      return true;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(`Error bulk adding equipment: ${errorMsg}`);
      return false;
    }
  };
  
  const setPageIndex = (pageIndex: number) => {
    setState(prev => ({ ...prev, pageIndex }));
  };
  
  const setPageSize = (pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, pageIndex: 0 }));
  };
  
  const setSorting = (sorting: any) => {
    setState(prev => ({ ...prev, sorting }));
  };
  
  const setFilter = (filter: EquipmentFilter) => {
    setState(prev => ({ ...prev, filter, pageIndex: 0 }));
  };
  
  return {
    // Return the state
    equipments: state.equipment,
    isLoading: state.loading,
    error: state.error,
    filter: state.filter,
    totalCount: state.totalCount,
    pageCount: state.pageCount,
    pageIndex: state.pageIndex,
    pageSize: state.pageSize,
    sorting: state.sorting,
    
    // Return the actions
    setFilter,
    setPageIndex,
    setPageSize,
    setSorting,
    fetchEquipments: fetchEquipment,
    createEquipment: addEquipment,
    updateEquipment,
    deleteEquipment,
    importEquipments: bulkAddEquipment
  };
}
