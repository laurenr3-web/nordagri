import { supabase } from '@/integrations/supabase/client';

// Type pour les équipements
export interface Equipment {
  id: number;
  name: string;
  model?: string;
  manufacturer?: string;
  year?: number;
  serialNumber?: string;
  purchaseDate?: Date;
  location?: string;
  status?: string;
  type?: string;
  category?: string;
  image?: string;
  notes?: string;
  owner_id?: string;
  unite_d_usure?: string;
  valeur_actuelle?: number;
  last_wear_update?: string | Date;
}

// Types pour la fonctionnalité de filtrage d'équipements
export interface EquipmentFilter {
  search?: string;
  status?: string[];
  type?: string[];
  category?: string[];
  manufacturer?: string[];
  location?: string[];
  yearMin?: number;
  yearMax?: number;
}

// Types pour les statistiques d'équipement
export interface EquipmentStats {
  total: number;
  operational: number;
  maintenance: number;
  repair: number;
  inactive: number;
  byCategory: { [key: string]: number };
  byType: { [key: string]: number };
}

// Types pour les options de filtres
export interface FilterOptions {
  status: string[];
  type: string[];
  category: string[];
  manufacturer: string[];
  location: string[];
  yearRange: {
    min: number;
    max: number;
  };
}

// Type pour les catégories d'équipement
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// Type pour les types d'équipement
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
