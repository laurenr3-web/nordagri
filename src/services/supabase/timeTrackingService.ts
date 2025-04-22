
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';

class TimeTrackingService {
  async getActiveTimeEntry(userId: string): Promise<TimeEntry | null> {
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .select(`
          id,
          user_id,
          owner_name,
          equipment_id,
          equipment:equipment_id (name),
          custom_task_type,
          start_time,
          end_time,
          status,
          notes
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
        
      if (error) {
        // Vérifier s'il y a des données en cache local
        const offlineData = localStorage.getItem('offline_active_time_entry');
        if (offlineData) {
          return JSON.parse(offlineData);
        }
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error in getActiveTimeEntry:", error);
      return null;
    }
  }
  
  async startTimeEntry(timeEntry: Partial<TimeEntry>): Promise<TimeEntry | null> {
    try {
      // Si hors ligne, stocker en local
      if (!navigator.onLine) {
        const offlineEntry = {
          ...timeEntry,
          id: `offline_${Date.now()}`,
          start_time: new Date().toISOString(),
          status: 'active',
          offline: true
        };
        
        localStorage.setItem('offline_active_time_entry', JSON.stringify(offlineEntry));
        localStorage.setItem(`offline_time_sessions_${offlineEntry.id}`, JSON.stringify(offlineEntry));
        
        // Ajouter à la liste des sessions à synchroniser
        const pendingSessions = JSON.parse(localStorage.getItem('pending_time_sessions') || '[]');
        pendingSessions.push(offlineEntry.id);
        localStorage.setItem('pending_time_sessions', JSON.stringify(pendingSessions));
        
        return offlineEntry as TimeEntry;
      }
      
      // Si en ligne, utiliser Supabase
      const { data, error } = await supabase
        .from('time_sessions')
        .insert({
          ...timeEntry,
          start_time: new Date().toISOString(),
          status: 'active'
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error starting time entry:", error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error in startTimeEntry:", error);
      return null;
    }
  }

  async stopTimeEntry(timeEntryId: string): Promise<boolean> {
    try {
      // Gérer le cas hors ligne
      if (!navigator.onLine) {
        const offlineEntry = localStorage.getItem(`offline_time_sessions_${timeEntryId}`);
        if (offlineEntry) {
          const entry = JSON.parse(offlineEntry);
          entry.status = 'completed';
          entry.end_time = new Date().toISOString();
          
          localStorage.setItem(`offline_time_sessions_${timeEntryId}`, JSON.stringify(entry));
          localStorage.removeItem('offline_active_time_entry');
          return true;
        }
        return false;
      }
      
      // Cas en ligne
      const { error } = await supabase
        .from('time_sessions')
        .update({
          status: 'completed',
          end_time: new Date().toISOString()
        })
        .eq('id', timeEntryId);
        
      if (error) {
        console.error("Error stopping time entry:", error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in stopTimeEntry:", error);
      return false;
    }
  }

  // Méthode de synchronisation des sessions hors ligne
  async syncOfflineSessions(): Promise<boolean> {
    try {
      const pendingSessions = JSON.parse(localStorage.getItem('pending_time_sessions') || '[]');
      if (pendingSessions.length === 0) return true;
      
      for (const sessionId of pendingSessions) {
        const sessionData = localStorage.getItem(`offline_time_sessions_${sessionId}`);
        if (!sessionData) continue;
        
        const session = JSON.parse(sessionData);
        delete session.id; // Supprimer l'ID temporaire
        delete session.offline; // Supprimer le marqueur offline
        
        // Insérer la session dans Supabase
        const { error } = await supabase
          .from('time_sessions')
          .insert(session);
          
        if (error) {
          console.error(`Error syncing session ${sessionId}:`, error);
          continue;
        }
        
        // Supprimer la session du stockage local
        localStorage.removeItem(`offline_time_sessions_${sessionId}`);
      }
      
      // Vider la liste des sessions en attente
      localStorage.removeItem('pending_time_sessions');
      localStorage.removeItem('offline_active_time_entry');
      
      return true;
    } catch (error) {
      console.error("Error syncing offline sessions:", error);
      return false;
    }
  }

  // ... autres méthodes existantes (pauseTimeEntry, resumeTimeEntry, etc.)
}

export const timeTrackingService = new TimeTrackingService();
