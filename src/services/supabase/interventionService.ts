
import { supabase } from '@/integrations/supabase/client';
import { Intervention, InterventionFormValues } from '@/types/Intervention';

export const interventionService = {
  // Récupérer toutes les interventions
  async getInterventions(): Promise<Intervention[]> {
    const { data, error } = await supabase
      .from('interventions')
      .select('*');
    
    if (error) {
      console.error('Error fetching interventions:', error);
      throw error;
    }
    
    // Convert database records to frontend objects
    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      equipment: item.equipment,
      equipmentId: item.equipment_id,
      location: item.location,
      coordinates: item.coordinates ? item.coordinates : { lat: 0, lng: 0 },
      status: item.status,
      priority: item.priority,
      date: new Date(item.date),
      duration: item.duration || undefined,
      scheduledDuration: item.scheduled_duration || undefined,
      technician: item.technician,
      description: item.description || '',
      partsUsed: item.parts_used ? item.parts_used : [],
      notes: item.notes || '',
    }));
  },
  
  // Ajouter une intervention
  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    const { user } = await supabase.auth.getUser();
    
    const newIntervention = {
      title: intervention.title,
      equipment: intervention.equipment,
      equipment_id: intervention.equipmentId,
      location: intervention.location,
      coordinates: { lat: 34.052235, lng: -118.243683 }, // Default coordinates
      status: 'scheduled',
      priority: intervention.priority,
      date: intervention.date.toISOString(),
      scheduled_duration: intervention.scheduledDuration,
      technician: intervention.technician,
      description: intervention.description,
      notes: intervention.notes,
      parts_used: [],
      owner_id: user ? user.id : null
    };
    
    const { data, error } = await supabase
      .from('interventions')
      .insert(newIntervention)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding intervention:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      location: data.location,
      coordinates: data.coordinates || { lat: 0, lng: 0 },
      status: data.status,
      priority: data.priority,
      date: new Date(data.date),
      duration: data.duration || undefined,
      scheduledDuration: data.scheduled_duration || undefined,
      technician: data.technician,
      description: data.description || '',
      partsUsed: data.parts_used || [],
      notes: data.notes || ''
    };
  },
  
  // Mettre à jour le statut d'une intervention
  async updateInterventionStatus(id: number, status: string): Promise<void> {
    const updates = { 
      status,
      ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {})
    };
    
    const { error } = await supabase
      .from('interventions')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      console.error('Error updating intervention status:', error);
      throw error;
    }
  },
  
  // Supprimer une intervention
  async deleteIntervention(id: number): Promise<void> {
    const { error } = await supabase
      .from('interventions')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting intervention:', error);
      throw error;
    }
  }
};
