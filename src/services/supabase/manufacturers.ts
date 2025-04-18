
import { supabase } from '@/integrations/supabase/client';

export interface Manufacturer {
  id: string;
  name: string;
  farm_id: string;
  created_at: string;
}

export async function getManufacturers(): Promise<Manufacturer[]> {
  const { data, error } = await supabase
    .from('manufacturers')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }

  return data || [];
}

export async function addManufacturer(name: string): Promise<Manufacturer> {
  // First check if the manufacturer already exists
  const { data: existingData } = await supabase
    .from('manufacturers')
    .select('*')
    .eq('name', name)
    .limit(1);

  if (existingData && existingData.length > 0) {
    return existingData[0];
  }

  // If not, insert the new manufacturer
  const { data, error } = await supabase
    .from('manufacturers')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error adding manufacturer:', error);
    throw error;
  }

  return data;
}
