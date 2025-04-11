
import { supabase } from '@/integrations/supabase/client';
import { Equipment, EquipmentFilter } from '@/types/Equipment';

/**
 * Service centralisé pour la gestion des API d'équipements
 */
export const equipmentService = {
  /**
   * Récupérer tous les équipements
   */
  async getAllEquipment(filters?: EquipmentFilter): Promise<Equipment[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;

      if (!userId) {
        console.warn('User not authenticated, returning empty equipment array');
        return [];
      }

      let query = supabase
        .from('equipment')
        .select('*')
        .eq('owner_id', userId);

      // Appliquer les filtres si présents
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
      }

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.category && filters.category.length > 0) {
        query = query.in('category', filters.category);
      }

      if (filters?.type && filters.type.length > 0) {
        query = query.in('type', filters.type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(mapDbEquipmentToModel);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      throw error;
    }
  },

  /**
   * Récupérer un équipement par son ID
   */
  async getEquipmentById(id: number): Promise<Equipment | null> {
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

      return mapDbEquipmentToModel(data);
    } catch (error) {
      console.error(`Error fetching equipment with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Ajouter un nouvel équipement
   */
  async addEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const equipmentData = {
        ...mapModelEquipmentToDb(equipment),
        owner_id: sessionData.session?.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbEquipmentToModel(data);
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  },

  /**
   * Mettre à jour un équipement existant
   */
  async updateEquipment(equipment: Equipment): Promise<Equipment> {
    try {
      const equipmentData = {
        ...mapModelEquipmentToDb(equipment),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('equipment')
        .update(equipmentData)
        .eq('id', equipment.id)
        .select()
        .single();
      
      if (error) throw error;
      
      return mapDbEquipmentToModel(data);
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  },

  /**
   * Supprimer un équipement
   */
  async deleteEquipment(id: number): Promise<void> {
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
};

/**
 * Mapper un équipement depuis le format de la base de données vers le modèle
 */
function mapDbEquipmentToModel(dbEquipment: any): Equipment {
  return {
    id: dbEquipment.id,
    name: dbEquipment.name,
    model: dbEquipment.model || '',
    manufacturer: dbEquipment.manufacturer || '',
    serialNumber: dbEquipment.serial_number || '',
    year: dbEquipment.year || null,
    purchaseDate: dbEquipment.purchase_date ? new Date(dbEquipment.purchase_date) : undefined,
    location: dbEquipment.location || '',
    status: dbEquipment.status || 'operational',
    type: dbEquipment.type || '',
    category: dbEquipment.category || '',
    image: dbEquipment.image || '',
    notes: dbEquipment.notes || ''
  };
}

/**
 * Mapper un équipement depuis le modèle vers le format de la base de données
 */
function mapModelEquipmentToDb(equipment: Partial<Equipment>): Record<string, any> {
  return {
    name: equipment.name,
    model: equipment.model,
    manufacturer: equipment.manufacturer,
    serial_number: equipment.serialNumber,
    year: equipment.year,
    purchase_date: equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString() : null,
    location: equipment.location,
    status: equipment.status,
    type: equipment.type,
    category: equipment.category,
    image: equipment.image,
    notes: equipment.notes
  };
}
