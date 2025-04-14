
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry, ActiveTimeEntry, TimeEntryTaskType, TimeEntryStatus } from './types';
import { toast } from 'sonner';
import { convertDatesToISOStrings } from '@/data/adapters/supabase/utils';

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
      
      // Utiliser une requête SQL personnalisée
      const { data, error } = await supabase
        .rpc('get_active_time_entry', { p_user_id: userId })
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 est le code pour "No rows returned", ce qui est normal si aucune entrée active
        throw error;
      }
      
      if (data) {
        // Transformer les données pour qu'elles correspondent à notre interface
        const activeEntry: ActiveTimeEntry = {
          id: data.id,
          user_id: data.user_id,
          equipment_id: data.equipment_id,
          intervention_id: data.intervention_id,
          task_type: data.task_type as TimeEntryTaskType,
          start_time: data.start_time,
          status: data.status as TimeEntryStatus,
          equipment_name: data.equipment_name,
          intervention_title: data.intervention_title
        };
        setActiveTimeEntry(activeEntry);
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
      
      // Préparer les données pour l'insertion
      const timeEntryData = {
        user_id: userId,
        equipment_id: params.equipment_id,
        intervention_id: params.intervention_id,
        task_type: params.task_type,
        notes: params.notes,
        location: locationData,
        status: 'active' as TimeEntryStatus,
        start_time: new Date().toISOString()
      };
      
      // Insérer l'entrée dans la table time_entries en utilisant une procédure RPC
      const { data, error } = await supabase
        .rpc('create_time_entry', {
          p_user_id: userId,
          p_equipment_id: params.equipment_id,
          p_intervention_id: params.intervention_id,
          p_task_type: params.task_type,
          p_notes: params.notes,
          p_location: locationData,
        });
      
      if (error) throw error;
      
      if (data) {
        // Construire l'entrée active complète depuis la réponse
        const newActiveEntry: ActiveTimeEntry = {
          id: data.id,
          user_id: data.user_id,
          equipment_id: data.equipment_id,
          intervention_id: data.intervention_id,
          task_type: data.task_type,
          start_time: data.start_time,
          status: data.status,
          equipment_name: data.equipment_name,
          intervention_title: data.intervention_title
        };
        
        setActiveTimeEntry(newActiveEntry);
        
        toast.success('Suivi de temps démarré', {
          description: 'L\'horloge tourne maintenant.'
        });
        
        return data as TimeEntry;
      } else {
        throw new Error("Échec de la création de l'entrée de temps");
      }
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
        .rpc('complete_time_entry', { p_entry_id: timeEntryId });
      
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
        .rpc('pause_time_entry', { p_entry_id: timeEntryId });
      
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
        .rpc('resume_time_entry', { p_entry_id: timeEntryId });
      
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
