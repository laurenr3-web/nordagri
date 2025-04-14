// Make sure to fix the issue with the missing name field when creating equipment
import { supabase } from '@/integrations/supabase/client';
import { EquipmentFilter } from '@/types/Equipment';
import { ensureNumberId } from '@/utils/typeGuards';
import { toast } from 'sonner';

export interface Equipment {
  id: number;
  name: string;
  type?: string;
  category?: string;
  model?: string;
  manufacturer?: string;
  serial_number?: string;
  location?: string;
  purchase_date?: string;
  status?: string;
  notes?: string;
  image?: string;
  year?: number;
}

// Données de démonstration pour les équipements
const demoEquipment = [
  {
    id: 1,
    name: "Tracteur John Deere 6130R",
    type: "Tracteur",
    category: "Machines agricoles",
    model: "6130R",
    manufacturer: "John Deere",
    serial_number: "JD6130R-2023-001",
    location: "Hangar principal",
    purchase_date: "2022-06-15",
    status: "operational",
    notes: "Dernier entretien: 01/03/2023",
    image: "https://placehold.co/600x400/png?text=Tracteur+John+Deere",
    year: 2022
  },
  {
    id: 2,
    name: "Moissonneuse New Holland CX8.90",
    type: "Moissonneuse",
    category: "Machines agricoles",
    model: "CX8.90",
    manufacturer: "New Holland",
    serial_number: "NH-CX890-2021-054",
    location: "Hangar Est",
    purchase_date: "2021-04-22",
    status: "maintenance",
    notes: "En cours de réparation - problème transmission",
    image: "https://placehold.co/600x400/png?text=Moissonneuse+New+Holland",
    year: 2021
  }
];

export const equipmentService = {
  async getEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching equipment data:', error);
        console.info('Returning demo equipment data');
        return demoEquipment;
      }
      
      if (!data || data.length === 0) {
        console.info('No equipment found, returning demo data');
        return demoEquipment;
      }
      
      return data;
    } catch (error) {
      console.error('Unexpected error in getEquipment:', error);
      console.info('Returning demo equipment data due to error');
      return demoEquipment;
    }
  },
  
  async getEquipmentById(id: number): Promise<Equipment> {
    try {
      // Ensure id is a number
      const numericId = ensureNumberId(id);
      
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (error) {
        console.error(`Error fetching equipment with id ${id}:`, error);
        // Retourner un équipement de démonstration correspondant à l'ID ou le premier si non trouvé
        const demoItem = demoEquipment.find(item => item.id === numericId) || demoEquipment[0];
        return demoItem;
      }
      
      return data;
    } catch (error) {
      console.error(`Unexpected error in getEquipmentById(${id}):`, error);
      // Retourner un équipement de démonstration par défaut
      return demoEquipment[0];
    }
  },
  
  async createEquipment(equipmentData: Omit<Equipment, 'id'>): Promise<Equipment> {
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating equipment:', error);
      throw error;
    }
    
    return data;
  },
  
  async updateEquipment(id: number, equipmentData: Partial<Equipment>): Promise<Equipment> {
    // Ensure id is a number
    const numericId = ensureNumberId(id);
    
    const { data, error } = await supabase
      .from('equipment')
      .update(equipmentData)
      .eq('id', numericId)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating equipment with id ${id}:`, error);
      throw error;
    }
    
    return data;
  },
  
  async deleteEquipment(id: number): Promise<void> {
    // Ensure id is a number
    const numericId = ensureNumberId(id);
    
    const { error } = await supabase
      .from('equipment')
      .delete()
      .eq('id', numericId);
    
    if (error) {
      console.error(`Error deleting equipment with id ${id}:`, error);
      throw error;
    }
  },
  
  async getEquipmentCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('category')
      .not('category', 'is', null);
    
    if (error) {
      console.error('Error fetching equipment categories:', error);
      throw error;
    }
    
    const categories = data
      .map(item => item.category)
      .filter((value, index, self) => value && self.indexOf(value) === index);
    
    return categories;
  },
  
  async getEquipmentByCategory(category: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('category', category);
    
    if (error) {
      console.error(`Error fetching equipment with category ${category}:`, error);
      throw error;
    }
    
    return data || [];
  },
  
  async createEquipmentWithMetadata(equipment: Omit<Equipment, 'id'>, userId: string): Promise<Equipment> {
    const now = new Date().toISOString();
    
    const equipmentWithMetadata = {
      ...equipment,
      owner_id: userId,
      created_at: now,
      updated_at: now,
    };
    
    const { data, error } = await supabase
      .from('equipment')
      .insert(equipmentWithMetadata)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating equipment with metadata:', error);
      throw error;
    }
    
    return data;
  }
};
