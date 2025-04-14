
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, ActiveTimeEntry, TimeEntryTaskType, TimeEntryStatus } from './types';
import { toast } from 'sonner';

export function useTimeTracking() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Charger l'entrée de temps active au chargement
  useEffect(() => {
    fetchActiveTimeEntry();
  }, []);

  // Récupérer l'entrée de temps active pour l'utilisateur actuel
  async function fetchActiveTimeEntry() {
    try {
      setIsLoading(true);
      
      // Obtenir la session utilisateur
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        setActiveTimeEntry(null);
        return;
      }
      
      const userId = sessionData.session.user.id;
      
      // Récupérer l'entrée de temps active avec un join sur l'équipement
      const { data, error } = await supabase.rpc(
        'get_active_time_entry',
        { p_user_id: userId }
      );
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Transformer les données de l'API pour qu'elles correspondent à notre interface
        setActiveTimeEntry(data[0] as ActiveTimeEntry);
      } else {
        setActiveTimeEntry(null);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération de l'entrée de temps active:", err);
      setError(err instanceof Error ? err : new Error('Erreur inconnue'));
    } finally {
      setIsLoading(false);
    }
  }

  // Démarrer une nouvelle entrée de temps
  async function startTimeEntry(params: {
    equipment_id?: number;
    intervention_id?: number;
    task_type: TimeEntryTaskType;
    notes?: string;
    location?: { lat: number; lng: number };
  }) {
    try {
      // Vérifier s'il y a déjà une entrée active
      if (activeTimeEntry) {
        throw new Error("Une entrée de temps est déjà active. Terminez-la avant d'en commencer une nouvelle.");
      }
      
      // Obtenir la session utilisateur
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("Vous devez être connecté pour enregistrer du temps.");
      }
      
      const userId = sessionData.session.user.id;
      
      // Préparer les données de localisation si fournies
      let locationData = null;
      if (params.location) {
        locationData = `POINT(${params.location.lng} ${params.location.lat})`;
      }
      
      // Insérer l'entrée dans la table time_entries
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: userId,
          equipment_id: params.equipment_id,
          intervention_id: params.intervention_id,
          task_type: params.task_type,
          notes: params.notes,
          location: locationData,
          status: 'active' as TimeEntryStatus,
          start_time: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Récupérer les informations complètes avec le nom de l'équipement
      if (data && params.equipment_id) {
        const { data: equipmentData } = await supabase
          .from('equipment')
          .select('name')
          .eq('id', params.equipment_id)
          .single();
          
        // Récupérer le titre de l'intervention si fourni
        let interventionTitle = undefined;
        if (params.intervention_id) {
          const { data: interventionData } = await supabase
            .from('Interventions')
            .select('title')
            .eq('id', params.intervention_id)
            .single();
            
          if (interventionData) {
            interventionTitle = interventionData.title;
          }
        }
        
        // Construire l'entrée active complète
        const newActiveEntry: ActiveTimeEntry = {
          id: data.id,
          user_id: data.user_id,
          equipment_id: data.equipment_id,
          intervention_id: data.intervention_id,
          task_type: data.task_type,
          start_time: data.start_time,
          status: data.status,
          equipment_name: equipmentData?.name,
          intervention_title: interventionTitle
        };
        
        setActiveTimeEntry(newActiveEntry);
      }
      
      toast.success('Suivi de temps démarré', {
        description: 'L\'horloge tourne maintenant.'
      });
      
      return data as TimeEntry;
    } catch (err) {
      console.error("Erreur lors du démarrage du suivi de temps:", err);
      toast.error('Erreur', {
        description: err instanceof Error ? err.message : 'Erreur lors du démarrage du suivi de temps'
      });
      throw err;
    }
  }

  // Terminer une entrée de temps active
  async function stopTimeEntry(timeEntryId: string) {
    try {
      // Vérifier que l'entrée existe et est active
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Impossible de terminer cette entrée de temps.");
      }
      
      // Mettre à jour l'entrée pour la terminer
      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed' as TimeEntryStatus
        })
        .eq('id', timeEntryId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setActiveTimeEntry(null);
      
      toast.success('Suivi de temps terminé', {
        description: 'Votre entrée de temps a été enregistrée.'
      });
    } catch (err) {
      console.error("Erreur lors de l'arrêt du suivi de temps:", err);
      toast.error('Erreur', {
        description: err instanceof Error ? err.message : 'Erreur lors de l\'arrêt du suivi de temps'
      });
      throw err;
    }
  }

  // Mettre en pause une entrée de temps active
  async function pauseTimeEntry(timeEntryId: string) {
    try {
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Impossible de mettre en pause cette entrée de temps.");
      }
      
      const { error } = await supabase
        .from('time_entries')
        .update({
          status: 'paused' as TimeEntryStatus
        })
        .eq('id', timeEntryId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setActiveTimeEntry(prev => prev ? {...prev, status: 'paused'} : null);
      
      toast.success('Suivi de temps mis en pause', {
        description: 'Vous pouvez reprendre plus tard.'
      });
    } catch (err) {
      console.error("Erreur lors de la mise en pause du suivi de temps:", err);
      toast.error('Erreur', {
        description: err instanceof Error ? err.message : 'Erreur lors de la mise en pause'
      });
      throw err;
    }
  }

  // Reprendre une entrée de temps en pause
  async function resumeTimeEntry(timeEntryId: string) {
    try {
      if (!activeTimeEntry || activeTimeEntry.id !== timeEntryId) {
        throw new Error("Impossible de reprendre cette entrée de temps.");
      }
      
      const { error } = await supabase
        .from('time_entries')
        .update({
          status: 'active' as TimeEntryStatus
        })
        .eq('id', timeEntryId);
      
      if (error) throw error;
      
      // Mettre à jour l'état local
      setActiveTimeEntry(prev => prev ? {...prev, status: 'active'} : null);
      
      toast.success('Suivi de temps repris', {
        description: 'L\'horloge tourne à nouveau.'
      });
    } catch (err) {
      console.error("Erreur lors de la reprise du suivi de temps:", err);
      toast.error('Erreur', {
        description: err instanceof Error ? err.message : 'Erreur lors de la reprise'
      });
      throw err;
    }
  }

  return {
    activeTimeEntry,
    isLoading,
    error,
    startTimeEntry,
    stopTimeEntry,
    pauseTimeEntry,
    resumeTimeEntry,
    refreshActiveTimeEntry: fetchActiveTimeEntry
  };
}
