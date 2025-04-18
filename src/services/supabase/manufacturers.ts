
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
    .insert([{ name, farm_id: await getCurrentFarmId() }])
    .select()
    .single();

  if (error) {
    console.error('Error adding manufacturer:', error);
    throw error;
  }

  return data;
}

// Fonction utilitaire pour obtenir le farm_id de l'utilisateur courant
async function getCurrentFarmId(): Promise<string> {
  const { data: userData, error } = await supabase.auth.getUser();
  
  if (error || !userData.user) {
    console.error('Error getting current user:', error);
    throw new Error('Unable to retrieve current user');
  }
  
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('farm_id')
    .eq('id', userData.user.id)
    .single();
  
  if (profileError || !profileData || !profileData.farm_id) {
    console.error('Error getting profile data:', profileError);
    throw new Error('Unable to retrieve farm_id');
  }
  
  return profileData.farm_id;
}
