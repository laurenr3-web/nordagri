
import { useEffect } from 'react';
import { isToday, isPast, isFuture } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { useFilter } from '@/hooks/maintenance/useFilter';

/**
 * Regroupe la logique métier pour l'écran Maintenance (filtrage, vue, highlight, organisation des tâches)
 * @param tasks Toutes les tâches de maintenance à afficher
 * @param setCurrentView Callback pour changer la vue courante
 * @returns Objets pour le rendu, valeurs filtres, handlers, etc.
 */
export function useMaintenanceContent(
  tasks: MaintenanceTask[],
  setCurrentView: (view: string) => void,
  userName = 'Utilisateur'
) {
  const [searchParams] = useSearchParams();
  const highlightedTaskId = searchParams.get('highlight');

  const { 
    filteredTasks, 
    filterValue, 
    setFilterValue, 
    searchQuery, 
    setSearchQuery, 
    filterOptions 
  } = useFilter(tasks);

  // Handle highlighted task (notification/jump)
  useEffect(() => {
    if (highlightedTaskId) {
      const taskId = parseInt(highlightedTaskId);
      const task = tasks.find(t => t.id === taskId);

      if (task) {
        if (task.status === 'completed') {
          setCurrentView('completed');
        } else if (isPast(task.dueDate) && !isToday(task.dueDate)) {
          setCurrentView('overdue');
        } else if (isToday(task.dueDate)) {
          setCurrentView('today');
        } else if (isFuture(task.dueDate)) {
          setCurrentView('upcoming');
        }
        toast.info(`Tâche sélectionnée : ${task.title}`, {
          description: `Pour l'équipement : ${task.equipment}`,
        });
      }
    }
  }, [highlightedTaskId, tasks, setCurrentView]);

  // Organise les tâches pour chaque vue
  const upcomingTasks = filteredTasks.filter(task =>
    task.status !== 'completed' && isFuture(task.dueDate)
  );
  const todayTasks = filteredTasks.filter(task =>
    task.status !== 'completed' && isToday(task.dueDate)
  );
  const overdueTasks = filteredTasks.filter(task =>
    task.status !== 'completed' && isPast(task.dueDate) && !isToday(task.dueDate)
  );
  const completedTasks = filteredTasks.filter(task =>
    task.status === 'completed'
  );

  /** Retourne les tâches à afficher selon la vue courante */
  function getCurrentTasks(currentView: string) {
    switch (currentView) {
      case 'today': return todayTasks;
      case 'overdue': return overdueTasks;
      case 'completed': return completedTasks;
      case 'calendar': return filteredTasks;
      case 'upcoming':
      default: return upcomingTasks;
    }
  }

  return {
    filterValue, setFilterValue,
    searchQuery, setSearchQuery,
    filterOptions,
    highlightedTaskId,
    getCurrentTasks
  };
}
