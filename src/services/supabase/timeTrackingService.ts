
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment } from '@/hooks/time-tracking/types';

/**
 * Service pour la gestion du suivi du temps
 */
export const timeTrackingService = {
  /**
   * Récupérer l'entrée de temps active pour un utilisateur
   */
  async getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*, equipment(name), interventions:Interventions(title)')
        .eq('user_id', userId)
        .eq('status', 'active')
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          equipment_name: data.equipment?.name,
          intervention_title: data.interventions?.title
        } as TimeEntry;
      }
      
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'entrée de temps active:", error);
      throw error;
    }
  },
  
  /**
   * Démarrer une nouvelle entrée de temps
   */
  async startTimeEntry(userId: string, data: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    notes?: string;
    location?: { lat: number; lng: number };
  }): Promise<TimeEntry> {
    try {
      // Préparer les données de localisation si fournies
      let locationData = null;
      if (data.location) {
        locationData = `POINT(${data.location.lng} ${data.location.lat})`;
      }
      
      const { data: result, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: userId,
          equipment_id: data.equipment_id,
          intervention_id: data.intervention_id,
          task_type: data.task_type,
          notes: data.notes,
          location: locationData,
          status: 'active' as TimeEntryStatus,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return result as TimeEntry;
    } catch (error) {
      console.error("Erreur lors du démarrage du suivi de temps:", error);
      throw error;
    }
  },
  
  /**
   * Arrêter une entrée de temps
   */
  async stopTimeEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed' as TimeEntryStatus
        })
        .eq('id', entryId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de l'arrêt du suivi de temps:", error);
      throw error;
    }
  },
  
  /**
   * Mettre en pause une entrée de temps
   */
  async pauseTimeEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          status: 'paused' as TimeEntryStatus
        })
        .eq('id', entryId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la mise en pause du suivi de temps:", error);
      throw error;
    }
  },
  
  /**
   * Reprendre une entrée de temps en pause
   */
  async resumeTimeEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update({
          status: 'active' as TimeEntryStatus
        })
        .eq('id', entryId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la reprise du suivi de temps:", error);
      throw error;
    }
  },
  
  /**
   * Récupérer les entrées de temps selon des filtres
   */
  async getTimeEntries(filters: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    equipmentId?: number;
    interventionId?: number;
    taskType?: TimeEntryTaskType;
    status?: TimeEntryStatus;
  }): Promise<TimeEntry[]> {
    try {
      let query = supabase
        .from('time_entries')
        .select('*, equipment(name), interventions:Interventions(title)')
        .eq('user_id', filters.userId);
      
      // Appliquer les filtres optionnels
      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate.toISOString());
      }
      
      if (filters.endDate) {
        query = query.lte('start_time', filters.endDate.toISOString());
      }
      
      if (filters.equipmentId) {
        query = query.eq('equipment_id', filters.equipmentId);
      }
      
      if (filters.interventionId) {
        query = query.eq('intervention_id', filters.interventionId);
      }
      
      if (filters.taskType) {
        query = query.eq('task_type', filters.taskType);
      }
      
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      // Exécuter la requête
      const { data, error } = await query.order('start_time', { ascending: false });
      
      if (error) throw error;
      
      // Transformer les données pour correspondre à l'interface TimeEntry
      return (data || []).map(item => ({
        ...item,
        equipment_name: item.equipment?.name,
        intervention_title: item.interventions?.title
      })) as TimeEntry[];
    } catch (error) {
      console.error("Erreur lors de la récupération des entrées de temps:", error);
      throw error;
    }
  },
  
  /**
   * Récupérer le temps passé par équipement
   */
  async getTimeSpentByEquipment(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<TimeSpentByEquipment[]> {
    try {
      const params: Record<string, any> = {
        p_user_id: userId
      };
      
      if (startDate) params.p_start_date = startDate.toISOString();
      if (endDate) params.p_end_date = endDate.toISOString();
      
      const { data, error } = await supabase.rpc(
        'get_time_spent_by_equipment',
        params
      );
      
      if (error) throw error;
      return data as TimeSpentByEquipment[];
    } catch (error) {
      console.error("Erreur lors de la récupération du temps par équipement:", error);
      throw error;
    }
  },
  
  /**
   * Supprimer une entrée de temps
   */
  async deleteTimeEntry(entryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la suppression de l'entrée de temps:", error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour une entrée de temps
   */
  async updateTimeEntry(entryId: string, data: Partial<TimeEntry>): Promise<void> {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(data)
        .eq('id', entryId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'entrée de temps:", error);
      throw error;
    }
  }
};
