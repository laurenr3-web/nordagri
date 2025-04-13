
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/providers/AuthProvider';

// Define the base equipment type
export interface Equipment {
  id: number | string;
  name: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  year?: string | number;
  serialNumber?: string;
  status?: string;
  location?: string;
  purchaseDate?: string;
  notes?: string;
  image?: string;
}

// Define our own SortingState type since it's not exported from react-query v5
type SortingState = {
  id: string;
  desc: boolean;
}[];

export function useEquipmentTable() {
  // Pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Data loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Equipment data from Supabase
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Auth context for user info
  const { user } = useAuthContext();
  
  // Calculate page count based on total items
  const pageCount = Math.ceil(totalCount / pageSize);

  // Effect to load data on mount or when dependencies change
  useEffect(() => {
    if (user) {
      fetchEquipments();
    }
  }, [user, pageIndex, pageSize, sorting]);

  // Real fetch function that calls Supabase
  const fetchEquipments = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching equipments with pagination:', { pageIndex, pageSize });
      console.log('And sorting:', sorting);
      
      // Build the initial query
      let query = supabase
        .from('equipment')
        .select('*', { count: 'exact' });
      
      // Apply sorting if present
      if (sorting.length > 0) {
        const { id, desc } = sorting[0];
        // Convert camelCase or PascalCase field names to snake_case for database
        const column = id
          .replace(/([a-z])([A-Z])/g, '$1_$2')
          .toLowerCase();
        
        query = query.order(column, { ascending: !desc });
      } else {
        // Default sorting by created_at
        query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination
      query = query
        .range(pageIndex * pageSize, (pageIndex + 1) * pageSize - 1);
      
      // Execute the query
      const { data, error, count } = await query;
      
      if (error) {
        throw error;
      }
      
      // Map database columns to our Equipment interface
      const mappedData: Equipment[] = data.map(item => ({
        id: item.id,
        name: item.name || 'Unnamed Equipment',
        type: item.type,
        manufacturer: item.manufacturer,
        model: item.model,
        year: item.year,
        serialNumber: item.serial_number,
        status: item.status,
        location: item.location,
        purchaseDate: item.purchase_date,
        notes: item.notes,
        image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop'
      }));
      
      setEquipments(mappedData);
      setTotalCount(count || 0);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching equipments:', error);
      toast.error('Erreur lors du chargement des équipements');
      setIsLoading(false);
      setEquipments([]);
    }
  };

  // Real create function that calls Supabase
  const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
    try {
      // Prepare data for database format
      const dbData = {
        name: data.name,
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model,
        year: data.year ? Number(data.year) : null,
        serial_number: data.serialNumber,
        status: data.status,
        location: data.location,
        purchase_date: data.purchaseDate,
        notes: data.notes,
        image: data.image,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: user?.id
      };
      
      const { data: newEquipment, error } = await supabase
        .from('equipment')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Map returned data to Equipment interface
      const mappedEquipment: Equipment = {
        id: newEquipment.id,
        name: newEquipment.name || 'New Equipment',
        type: newEquipment.type,
        manufacturer: newEquipment.manufacturer,
        model: newEquipment.model,
        year: newEquipment.year,
        serialNumber: newEquipment.serial_number,
        status: newEquipment.status,
        location: newEquipment.location,
        purchaseDate: newEquipment.purchase_date,
        notes: newEquipment.notes,
        image: newEquipment.image
      };
      
      // Update local state (optional, can just refetch)
      setEquipments(prev => [...prev, mappedEquipment]);
      setTotalCount(prev => prev + 1);
      
      toast.success('Équipement ajouté avec succès');
      return mappedEquipment;
    } catch (error) {
      console.error('Error creating equipment:', error);
      toast.error('Erreur lors de la création de l\'équipement');
      throw error;
    }
  };

  // Real update function that calls Supabase
  const updateEquipment = async (id: string | number, data: Partial<Equipment>): Promise<void> => {
    try {
      // Prepare data for database format
      const dbData = {
        name: data.name,
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model,
        year: data.year ? Number(data.year) : null,
        serial_number: data.serialNumber,
        status: data.status,
        location: data.location,
        purchase_date: data.purchaseDate,
        notes: data.notes,
        image: data.image,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('equipment')
        .update(dbData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipments(prev => 
        prev.map(equip => 
          equip.id === id ? { ...equip, ...data } : equip
        )
      );
      
      toast.success('Équipement mis à jour avec succès');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Erreur lors de la mise à jour de l\'équipement');
      throw error;
    }
  };

  // Real delete function that calls Supabase
  const deleteEquipment = async (id: string | number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setEquipments(prev => prev.filter(equip => equip.id !== id));
      setTotalCount(prev => prev - 1);
      
      toast.success('Équipement supprimé avec succès');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      toast.error('Erreur lors de la suppression de l\'équipement');
      throw error;
    }
  };

  // Import function to import multiple equipment at once
  const importEquipments = async (data: Partial<Equipment>[]): Promise<void> => {
    try {
      // Prepare data for database format
      const dbData = data.map(item => ({
        name: item.name || 'Imported Equipment',
        type: item.type,
        manufacturer: item.manufacturer,
        model: item.model,
        year: item.year ? Number(item.year) : null,
        serial_number: item.serialNumber,
        status: item.status,
        location: item.location,
        purchase_date: item.purchaseDate,
        notes: item.notes,
        image: item.image,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        owner_id: user?.id
      }));
      
      const { error } = await supabase
        .from('equipment')
        .insert(dbData);
      
      if (error) {
        throw error;
      }
      
      // Refetch the equipment list to include the new imports
      fetchEquipments();
      
      toast.success(`${data.length} équipements importés avec succès`);
    } catch (error) {
      console.error('Error importing equipments:', error);
      toast.error('Erreur lors de l\'import des équipements');
      throw error;
    }
  };

  return {
    equipments,
    isLoading,
    pageCount,
    pageIndex,
    pageSize,
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
}
