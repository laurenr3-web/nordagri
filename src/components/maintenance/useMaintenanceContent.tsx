
import { useEffect } from 'react';
import { isToday, isPast, isFuture } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { useFilter } from '@/hooks/maintenance/useFilter';

/**
 * Determines if a counter-based task is overdue by comparing
 * equipment current value against the trigger threshold.
 */
function isCounterOverdue(task: MaintenanceTask): boolean {
  const currentValue = task.equipment_current_value;
  if (currentValue == null) return false;

  if (task.trigger_unit === 'hours' && task.trigger_hours != null) {
    return currentValue >= task.trigger_hours;
  }
  if (task.trigger_unit === 'kilometers' && task.trigger_kilometers != null) {
    return currentValue >= task.trigger_kilometers;
  }
  return false;
}

function isCounterBased(task: MaintenanceTask): boolean {
  return (
    (task.trigger_unit === 'hours' && task.trigger_hours != null) ||
    (task.trigger_unit === 'kilometers' && task.trigger_kilometers != null)
  );
}

/**
 * Regroupe la logique métier pour l'écran Maintenance (filtrage, vue, highlight, organisation des tâches)
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
        } else if (isCounterBased(task) ? isCounterOverdue(task) : (isPast(task.dueDate) && !isToday(task.dueDate))) {
          setCurrentView('overdue');
        } else if (!isCounterBased(task) && isToday(task.dueDate)) {
          setCurrentView('today');
        } else {
          setCurrentView('upcoming');
        }
        toast.info(`Tâche sélectionnée : ${task.title}`, {
          description: `Pour l'équipement : ${task.equipment}`,
        });
      }
    }
  }, [highlightedTaskId, tasks, setCurrentView]);

  // Organise les tâches pour chaque vue
  const overdueTasks = filteredTasks.filter(task => {
    if (task.status === 'completed') return false;
    if (isCounterBased(task)) return isCounterOverdue(task);
    return isPast(task.dueDate) && !isToday(task.dueDate);
  });

  const todayTasks = filteredTasks.filter(task => {
    if (task.status === 'completed') return false;
    if (isCounterBased(task)) return false; // counter tasks are either overdue or upcoming
    return isToday(task.dueDate);
  });

  const upcomingTasks = filteredTasks.filter(task => {
    if (task.status === 'completed') return false;
    if (isCounterBased(task)) return !isCounterOverdue(task);
    return isFuture(task.dueDate);
  });

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
