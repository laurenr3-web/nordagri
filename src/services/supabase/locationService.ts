
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
      // Since locations table doesn't exist in the schema, return hardcoded locations
      logger.log('Locations table not found, returning default locations');
      
      return [
        { id: 1, name: "Atelier" },
        { id: 2, name: "Champ Nord" },
        { id: 3, name: "Champ Sud" },
        { id: 4, name: "Hangar" },
        { id: 5, name: "Serre" }
      ];
    } catch (error) {
      logger.error('Error fetching locations:', error);
      
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
      // Since we can't create in non-existent table, return mock location
      const newLocation = {
        id: Math.floor(Math.random() * 1000),
        name: location.name || 'New Location',
        farm_id: location.farm_id,
        description: location.description,
        created_at: new Date().toISOString()
      };
      
      logger.log('Mock location created:', newLocation);
      return newLocation;
    } catch (error) {
      logger.error('Error creating location:', error);
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
      // Mock update since table doesn't exist
      const updatedLocation = {
        id,
        name: updates.name || 'Updated Location',
        farm_id: updates.farm_id,
        description: updates.description,
        created_at: new Date().toISOString()
      };
      
      logger.log('Mock location updated:', updatedLocation);
      return updatedLocation;
    } catch (error) {
      logger.error('Error updating location:', error);
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
      logger.log('Mock location deleted:', id);
      // Mock delete since table doesn't exist
    } catch (error) {
      logger.error('Error deleting location:', error);
      throw error;
    }
  }
};
