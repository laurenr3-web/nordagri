
import { supabase } from '@/integrations/supabase/client';

export interface Location {
  id: number;
  name: string;
  farm_id?: string;
  description?: string;
  created_at?: string;
}

/**
 * Service for managing field and work locations
 */
export const locationService = {
  /**
   * Get all locations for a farm
   * @param farmId The farm ID
   * @returns Promise with locations array
   */
  async getLocations(farmId?: string): Promise<Location[]> {
    try {
      // If we have a farmId, filter by that farm
      const query = supabase.from('locations').select('*');
      
      if (farmId) {
        query.eq('farm_id', farmId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      
      // Return hardcoded default locations as fallback
      return [
        { id: 1, name: "Atelier" },
        { id: 2, name: "Champ Nord" },
        { id: 3, name: "Champ Sud" },
        { id: 4, name: "Hangar" },
        { id: 5, name: "Serre" }
      ];
    }
  },
  
  /**
   * Create a new location
   * @param location The location data to create
   * @returns Promise with the created location
   */
  async createLocation(location: Partial<Location>): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },
  
  /**
   * Update a location
   * @param id The location ID
   * @param updates The updates to apply
   * @returns Promise with the updated location
   */
  async updateLocation(id: number, updates: Partial<Location>): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },
  
  /**
   * Delete a location
   * @param id The location ID to delete
   * @returns Promise indicating success
   */
  async deleteLocation(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};
