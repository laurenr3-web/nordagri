
import { MaintenanceStatus, MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, CheckCircle2, AlertTriangle, Loader2, Clock } from 'lucide-react';

// Regrouper les tâches par catégorie
export const categorizeMaintenanceTasks = (tasks: MaintenanceTask[]) => {
  const upcomingTasks = tasks.filter(task => 
    task.status !== 'completed' && isFuture(task.dueDate)
  );
  
  const todayTasks = tasks.filter(task => 
    task.status !== 'completed' && isToday(task.dueDate)
  );
  
  const overdueTask = tasks.filter(task => 
    task.status !== 'completed' && isPast(task.dueDate) && !isToday(task.dueDate)
  );
  
  const completedTasks = tasks.filter(task => 
    task.status === 'completed'
  );
  
  return { upcomingTasks, todayTasks, overdueTask, completedTasks };
};

// Obtenir les informations sur la vue actuelle
export const getViewInfo = (currentView: string) => {
  switch (currentView) {
    case 'today':
      return {
        title: 'Tâches du jour',
        description: format(new Date(), 'd MMMM yyyy', { locale: fr }),
        icon: <CalendarIcon className="mr-2 h-5 w-5 text-blue-500" />
      };
    case 'overdue':
      return {
        title: 'Tâches en retard',
        description: 'Tâches dont l\'échéance est dépassée',
        icon: <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
      };
    case 'completed':
      return {
        title: 'Tâches terminées',
        description: 'Historique des tâches complétées',
        icon: <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
      };
    case 'calendar':
      return {
        title: 'Calendrier de maintenance',
        description: 'Vue mensuelle des tâches planifiées',
        icon: <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
      };
    case 'upcoming':
    default:
      return {
        title: 'Tâches à venir',
        description: 'Tâches planifiées pour les prochains jours',
        icon: <Clock className="mr-2 h-5 w-5 text-primary" />
      };
  }
};

// Style CSS pour l'effet de pulsation de surbrillance
export const highlightPulseStyle = `
  .highlight-pulse {
    animation: highlight-pulse 3s ease-in-out;
  }
  
  @keyframes highlight-pulse {
    0%, 100% {
      background-color: transparent;
    }
    20% {
      background-color: rgba(59, 130, 246, 0.1);
    }
    50% {
      background-color: rgba(59, 130, 246, 0.15);
    }
    80% {
      background-color: rgba(59, 130, 246, 0.1);
    }
  }
`;
