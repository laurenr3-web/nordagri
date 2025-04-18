
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentType {
  id: string;
  name: string;
  farm_id: string | null;
}

export async function getEquipmentTypes(): Promise<EquipmentType[]> {
  const { data, error } = await supabase
    .from('equipment_types')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function createEquipmentType(name: string): Promise<EquipmentType> {
  const { data, error } = await supabase
    .from('equipment_types')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
