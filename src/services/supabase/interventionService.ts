
import { supabase } from '@/integrations/supabase/client';
import { InterventionDB, Intervention, InterventionFormValues } from '@/types/models/intervention';
import { clientToDbIntervention, dbToClientIntervention, clientFormToDbIntervention } from './interventionAdapter';

/**
 * Service to handle intervention data from Supabase
 */
export const interventionService = {
  /**
   * Get all interventions
   */
  async getInterventions(): Promise<Intervention[]> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching interventions: ${error.message}`);
      }

      return (data as InterventionDB[]).map(dbToClientIntervention);
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to load interventions: ${error.message}`);
    }
  },

  /**
   * Get intervention by ID
   */
  async getInterventionById(id: string | number): Promise<Intervention | null> {
    try {
      // Convert string id to number if needed
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', numericId)
        .single();

      if (error) {
        throw new Error(`Error fetching intervention: ${error.message}`);
      }

      if (!data) return null;

      return dbToClientIntervention(data as InterventionDB);
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to load intervention: ${error.message}`);
    }
  },

  /**
   * Create a new intervention
   */
  async createIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    try {
      // Convert client data to DB format
      const dbIntervention = clientFormToDbIntervention(intervention);
      
      // Ensure required fields are present with default values and remove id if present
      // This fixes the 'id' incompatible with 'never' type error
      const { id, ...insertData } = {
        title: dbIntervention.title || 'Untitled Intervention', // Ensure title is always set
        date: dbIntervention.date || new Date().toISOString(),
        equipment: dbIntervention.equipment || 'Unknown',
        equipment_id: dbIntervention.equipment_id || 0,
        location: dbIntervention.location || 'Unknown',
        status: dbIntervention.status || 'scheduled',
        technician: dbIntervention.technician || '',
        priority: dbIntervention.priority || 'medium', // Ensure priority is always set
        ...dbIntervention
      };
      
      const { data, error } = await supabase
        .from('interventions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating intervention: ${error.message}`);
      }

      return dbToClientIntervention(data as InterventionDB);
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to create intervention: ${error.message}`);
    }
  },

  /**
   * Update an intervention
   */
  async updateIntervention(id: number, intervention: Partial<Intervention>): Promise<Intervention> {
    try {
      // Convert client data to DB format
      const dbIntervention = clientToDbIntervention(intervention as Intervention);
      
      // Remove the id from the update payload
      const { id: _, ...updateData } = dbIntervention;
      
      const { data, error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating intervention: ${error.message}`);
      }

      return dbToClientIntervention(data as InterventionDB);
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to update intervention: ${error.message}`);
    }
  },
  
  /**
   * Update intervention status
   */
  async updateInterventionStatus(id: number, status: string): Promise<Intervention> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating intervention status: ${error.message}`);
      }

      return dbToClientIntervention(data as InterventionDB);
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to update intervention status: ${error.message}`);
    }
  },

  /**
   * Delete an intervention
   */
  async deleteIntervention(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting intervention: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Intervention service error:', error);
      throw new Error(`Failed to delete intervention: ${error.message}`);
    }
  }
};
