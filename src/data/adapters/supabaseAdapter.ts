
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter } from '@/data/models/equipment';

/**
 * Mappers pour convertir entre les formats de base de données et les modèles internes
 */
const mapDbToEquipment = (item: any): Equipment => ({
  id: item.id,
  name: item.name,
  model: item.model,
  manufacturer: item.manufacturer,
  year: item.year,
  serialNumber: item.serial_number,
  purchaseDate: item.purchase_date ? new Date(item.purchase_date) : undefined,
  location: item.location,
  status: item.status,
  type: item.type,
  category: item.category,
  image: item.image,
  notes: item.notes
});

const mapEquipmentToDb = (equipment: Omit<Equipment, 'id'>) => ({
  name: equipment.name,
  model: equipment.model,
  manufacturer: equipment.manufacturer,
  year: equipment.year,
  serial_number: equipment.serialNumber,
  purchase_date: equipment.purchaseDate,
  location: equipment.location,
  status: equipment.status,
  type: equipment.type,
  category: equipment.category,
  image: equipment.image,
  notes: equipment.notes
});

/**
 * Fonction utilitaire pour convertir les dates en strings ISO
 */
function convertDatesToISOStrings(obj: Record<string, any>): Record<string, any> {
  const result = { ...obj };
  
  for (const key in result) {
    if (result[key] instanceof Date) {
      result[key] = result[key].toISOString();
    }
  }
  
  return result;
}

/**
 * Application des filtres à la requête Supabase
 */
const applyFilters = (query: any, filters?: EquipmentFilter) => {
  if (!filters) return query;

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  if (filters.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters.type && filters.type.length > 0) {
    query = query.in('type', filters.type);
  }

  if (filters.category && filters.category.length > 0) {
    query = query.in('category', filters.category);
  }

  if (filters.manufacturer && filters.manufacturer.length > 0) {
    query = query.in('manufacturer', filters.manufacturer);
  }

  if (filters.location && filters.location.length > 0) {
    query = query.in('location', filters.location);
  }

  if (filters.yearMin) {
    query = query.gte('year', filters.yearMin);
  }

  if (filters.yearMax) {
    query = query.lte('year', filters.yearMax);
  }

  return query;
};

/**
 * Adaptateur Supabase pour les équipements
 */
export const supabaseAdapter = {
  equipment: {
    async getAll(filters?: EquipmentFilter): Promise<Equipment[]> {
      try {
        let query = supabase.from('equipment').select('*');
        
        // Appliquer les filtres à la requête
        query = applyFilters(query, filters);
        
        // Exécuter la requête
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        return data.map(mapDbToEquipment);
      } catch (error) {
        console.error('Error fetching equipment:', error);
        throw error;
      }
    },
    
    async getById(id: number): Promise<Equipment | null> {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Not found
          }
          throw error;
        }
        
        return mapDbToEquipment(data);
      } catch (error) {
        console.error(`Error fetching equipment with ID ${id}:`, error);
        throw error;
      }
    },
    
    async add(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
      try {
        // Get the current user session
        const { data: sessionData } = await supabase.auth.getSession();
        
        // Prepare equipment data with dates converted to ISO strings
        const dbEquipment = convertDatesToISOStrings({
          ...mapEquipmentToDb(equipment),
          owner_id: sessionData.session?.user.id,
          created_at: new Date(),
          updated_at: new Date()
        });
        
        // Insert the equipment
        const { data, error } = await supabase
          .from('equipment')
          .insert(dbEquipment)
          .select()
          .single();
        
        if (error) throw error;
        
        return mapDbToEquipment(data);
      } catch (error) {
        console.error('Error adding equipment:', error);
        throw error;
      }
    },
    
    async update(equipment: Equipment): Promise<Equipment> {
      try {
        // Prepare equipment data with dates converted to ISO strings
        const dbEquipment = convertDatesToISOStrings({
          ...mapEquipmentToDb(equipment),
          updated_at: new Date()
        });
        
        // Update the equipment
        const { data, error } = await supabase
          .from('equipment')
          .update(dbEquipment)
          .eq('id', equipment.id)
          .select()
          .single();
        
        if (error) throw error;
        
        return mapDbToEquipment(data);
      } catch (error) {
        console.error('Error updating equipment:', error);
        throw error;
      }
    },
    
    async delete(id: number): Promise<void> {
      try {
        const { error } = await supabase
          .from('equipment')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } catch (error) {
        console.error(`Error deleting equipment with ID ${id}:`, error);
        throw error;
      }
    }
  }
};
