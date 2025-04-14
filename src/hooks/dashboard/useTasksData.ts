
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface UpcomingTask {
  id: string | number;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  priority: string;
  assignedTo: string;
}

export const useTasksData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTasksData();
  }, [user]);

  const fetchTasksData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch tasks from Supabase
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('status', 'scheduled')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;

      if (data) {
        const tasks: UpcomingTask[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.notes || 'Pas de description',
          dueDate: new Date(item.due_date),
          status: item.status,
          priority: item.priority,
          assignedTo: item.assigned_to || 'Non assigné'
        }));
        setUpcomingTasks(tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks data:', error);
      setError("Impossible de récupérer les tâches à venir");
      
      // Utilisation des données par défaut uniquement en mode développement ou après confirmation
      if (import.meta.env.DEV) {
        setUpcomingTasks([
          {
            id: 1,
            title: "Changement filtre à huile",
            description: "Remplacer le filtre à huile du moteur",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
            status: "pending",
            priority: "high",
            assignedTo: "Michael Torres"
          },
          {
            id: 2,
            title: "Calibration du système GPS",
            description: "Calibrer le système de navigation GPS",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
            status: "pending",
            priority: "medium",
            assignedTo: "David Chen"
          },
          {
            id: 3,
            title: "Vérification système hydraulique",
            description: "Inspecter les fuites potentielles",
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            status: "pending",
            priority: "low",
            assignedTo: "Sarah Johnson"
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    upcomingTasks,
    error,
    retry: fetchTasksData
  };
};

export default useTasksData;
