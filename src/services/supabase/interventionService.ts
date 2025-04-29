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
      coordinates: item.coordinates ? 
        (typeof item.coordinates === 'object' && item.coordinates !== null ? 
          { 
            lat: typeof item.coordinates === 'object' && 'lat' in item.coordinates ? 
              Number(item.coordinates.lat) || 0 : 0, 
            lng: typeof item.coordinates === 'object' && 'lng' in item.coordinates ? 
              Number(item.coordinates.lng) || 0 : 0 
          } : 
          { lat: 0, lng: 0 }
        ) : { lat: 0, lng: 0 },
      status: (item.status as Intervention['status']) || 'scheduled',
      priority: (item.priority as Intervention['priority']) || 'medium',
      date: new Date(item.date),
      duration: item.duration || undefined,
      scheduledDuration: item.scheduled_duration || undefined,
      technician: item.technician,
      description: item.description || '',
      partsUsed: item.parts_used ? 
        (Array.isArray(item.parts_used) ? 
          item.parts_used.map((p: any) => ({
            id: p.id || 0,
            name: p.name || '',
            quantity: p.quantity || 0
          })) : []
        ) : [],
      notes: item.notes || '',
    }));
  },
  
  // Récupérer une intervention par son ID
  async getInterventionById(id: string | number): Promise<Intervention> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .eq('id', numericId)
      .single();
    
    if (error) {
      console.error(`Error fetching intervention with id ${id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      location: data.location,
      coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
        { 
          lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
            Number(data.coordinates.lat) || 0 : 0, 
          lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
            Number(data.coordinates.lng) || 0 : 0 
        } : 
        { lat: 0, lng: 0 },
      status: (data.status as Intervention['status']) || 'scheduled',
      priority: (data.priority as Intervention['priority']) || 'medium',
      date: new Date(data.date),
      duration: data.duration || undefined,
      scheduledDuration: data.scheduled_duration || undefined,
      technician: data.technician,
      description: data.description || '',
      partsUsed: Array.isArray(data.parts_used) ? 
        data.parts_used.map((p: any) => ({
          id: p.id || 0,
          name: p.name || '',
          quantity: p.quantity || 0
        })) : [],
      notes: data.notes || ''
    };
  },
  
  // Ajouter une intervention
  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw sessionError;
    }
    
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
      owner_id: sessionData.session?.user.id
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
      coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
        { 
          lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
            Number(data.coordinates.lat) || 0 : 0, 
          lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
            Number(data.coordinates.lng) || 0 : 0 
        } : 
        { lat: 0, lng: 0 },
      status: (data.status as Intervention['status']) || 'scheduled',
      priority: (data.priority as Intervention['priority']) || 'medium',
      date: new Date(data.date),
      duration: data.duration || undefined,
      scheduledDuration: data.scheduled_duration || undefined,
      technician: data.technician,
      description: data.description || '',
      partsUsed: Array.isArray(data.parts_used) ? 
        data.parts_used.map((p: any) => ({
          id: p.id || 0,
          name: p.name || '',
          quantity: p.quantity || 0
        })) : [],
      notes: data.notes || ''
    };
  },
  
  // Mettre à jour une intervention
  async updateIntervention(intervention: Intervention): Promise<Intervention> {
    const updates = {
      title: intervention.title,
      equipment: intervention.equipment,
      equipment_id: intervention.equipmentId,
      location: intervention.location,
      coordinates: intervention.coordinates,
      status: intervention.status,
      priority: intervention.priority,
      date: intervention.date.toISOString(),
      duration: intervention.duration,
      scheduled_duration: intervention.scheduledDuration,
      technician: intervention.technician,
      description: intervention.description,
      parts_used: intervention.partsUsed,
      notes: intervention.notes,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('interventions')
      .update(updates)
      .eq('id', intervention.id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating intervention with id ${intervention.id}:`, error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      location: data.location,
      coordinates: data.coordinates && typeof data.coordinates === 'object' ? 
        { 
          lat: typeof data.coordinates === 'object' && 'lat' in data.coordinates ? 
            Number(data.coordinates.lat) || 0 : 0, 
          lng: typeof data.coordinates === 'object' && 'lng' in data.coordinates ? 
            Number(data.coordinates.lng) || 0 : 0 
        } : 
        { lat: 0, lng: 0 },
      status: (data.status as Intervention['status']) || 'scheduled',
      priority: (data.priority as Intervention['priority']) || 'medium',
      date: new Date(data.date),
      duration: data.duration || undefined,
      scheduledDuration: data.scheduled_duration || undefined,
      technician: data.technician,
      description: data.description || '',
      partsUsed: Array.isArray(data.parts_used) ? 
        data.parts_used.map((p: any) => ({
          id: p.id || 0,
          name: p.name || '',
          quantity: p.quantity || 0
        })) : [],
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
