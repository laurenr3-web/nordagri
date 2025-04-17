
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TimeBreakdownData {
  task_type: string;
  minutes: number;
  color: string;
}

const TASK_COLORS = {
  'maintenance': '#10B981', // Emerald
  'repair': '#67E8F9',     // Cyan
  'inspection': '#6EE7B7', // Green
  'operation': '#8B5CF6',  // Purple
  'traite': '#D946EF',     // Pink
  'entretien': '#60A5FA',  // Blue
  'mécanique': '#F59E0B',  // Amber
  'other': '#6B7280'       // Gray
};

export function useTimeBreakdown() {
  const [data, setData] = useState<TimeBreakdownData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTimeBreakdown = async () => {
      try {
        setIsLoading(true);
        
        // Récupérer la session de l'utilisateur actuel
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          setData([]);
          setIsLoading(false);
          return;
        }

        const userId = sessionData.session.user.id;

        // Récupérer le mapping des types de tâches
        const { data: taskTypes } = await supabase
          .from('task_types')
          .select('id, name');
          
        // Créer un mapping d'ID vers nom de type de tâche
        const taskTypeNameById = new Map<string, string>();
        if (taskTypes) {
          taskTypes.forEach(type => {
            taskTypeNameById.set(type.id, type.name);
          });
        }
        
        // Récupérer les sessions terminées
        const { data: timeData, error: timeError } = await supabase
          .from('time_sessions')
          .select(`
            task_type_id,
            custom_task_type,
            duration
          `)
          .eq('status', 'completed')
          .eq('user_id', userId)
          .not('duration', 'is', null);

        if (timeError) throw timeError;

        // Traiter les données pour le graphique
        const groupedData: Record<string, number> = {};
        
        timeData.forEach(session => {
          let taskType: string;
          
          // Déterminer le type de tâche en priorité depuis task_type_id
          if (session.task_type_id && taskTypeNameById.has(session.task_type_id)) {
            taskType = taskTypeNameById.get(session.task_type_id) || 'other';
          } 
          // Sinon, utiliser custom_task_type si disponible
          else if (session.custom_task_type) {
            taskType = session.custom_task_type;
          } 
          // Fallback
          else {
            taskType = 'other';
          }
          
          const duration = session.duration || 0;
          
          if (!groupedData[taskType]) {
            groupedData[taskType] = 0;
          }
          groupedData[taskType] += duration * 60; // Convertir les heures en minutes
        });

        // Convertir au format requis par le graphique
        const chartData = Object.entries(groupedData).map(([task_type, minutes]) => {
          const normalizedType = task_type.toLowerCase();
          return {
            task_type,
            minutes,
            color: TASK_COLORS[normalizedType as keyof typeof TASK_COLORS] || TASK_COLORS.other
          };
        });

        setData(chartData);
      } catch (err) {
        console.error('Error fetching time breakdown:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeBreakdown();
  }, []);

  return { data, isLoading, error };
}
