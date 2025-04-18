
import { supabase } from '@/integrations/supabase/client';

export interface StorageLocation {
  id: string;
  name: string;
  farm_id: string;
  description: string | null;
  created_at: string;
}

export async function getStorageLocations(): Promise<StorageLocation[]> {
  const { data, error } = await supabase
    .from('storage_locations')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching storage locations:', error);
    throw error;
  }

  return data || [];
}

export async function addStorageLocation(name: string, description?: string): Promise<StorageLocation> {
  // First check if the location already exists
  const { data: existingData } = await supabase
    .from('storage_locations')
    .select('*')
    .eq('name', name)
    .limit(1);

  if (existingData && existingData.length > 0) {
    return existingData[0];
  }

  // If not, insert the new location
  const { data, error } = await supabase
    .from('storage_locations')
    .insert([{ name, description }])
    .select()
    .single();

  if (error) {
    console.error('Error adding storage location:', error);
    throw error;
  }

  return data;
}
