
import { useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { isPast, isToday } from 'date-fns';
import { Clock } from 'lucide-react';

export function useHighlightedTask(
  tasks: MaintenanceTask[],
  highlightedTaskId: string | null,
  taskId: string | null,
  setCurrentView: (view: string) => void
) {
  useEffect(() => {
    const targetTaskId = highlightedTaskId || taskId;
    
    if (targetTaskId) {
      const id = parseInt(targetTaskId);
      const task = tasks.find(t => t.id === id);
      
      if (task) {
        // Set the appropriate view based on task status and date
        if (task.status === 'completed') {
          setCurrentView('completed');
        } else if (isPast(task.dueDate) && !isToday(task.dueDate)) {
          setCurrentView('overdue');
        } else if (isToday(task.dueDate)) {
          setCurrentView('today');
        } else {
          setCurrentView('upcoming');
        }
        
        // Notify the user with a toast using the sonner API format
        toast.info("Tâche sélectionnée", {
          description: `${task.title} - Pour l'équipement : ${task.equipment}`,
          duration: 4000,
          icon: <Clock className="h-4 w-4 text-blue-600" />
        });
        
        // Scroll to highlighted element with smooth animation after a brief delay
        setTimeout(() => {
          const element = document.getElementById(`task-${id}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            element.classList.add('highlight-pulse');
            setTimeout(() => {
              element.classList.remove('highlight-pulse');
            }, 3000);
          }
        }, 500);
      }
    }
  }, [highlightedTaskId, taskId, tasks, setCurrentView]);
  
  return {
    highlightedTaskId: highlightedTaskId || taskId ? parseInt(highlightedTaskId || taskId!) : undefined
  };
}
