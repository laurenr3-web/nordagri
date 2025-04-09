
import React, { useEffect } from 'react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceFilters } from '@/components/maintenance/MaintenanceFilters';
import { Calendar as CalendarIcon, CheckCircle2, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { useFilter } from '@/hooks/maintenance/useFilter';
import CalendarView from '@/components/maintenance/CalendarView';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BlurContainer } from '@/components/ui/blur-container';
import { Widget } from '@/components/ui/widget';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MaintenanceContentProps {
  tasks: MaintenanceTask[];
  currentView: string;
  setCurrentView: (view: string) => void;
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
  updateTaskStatus: (taskId: number, status: MaintenanceStatus) => void;
  updateTaskPriority: (taskId: number, priority: MaintenancePriority) => void;
  deleteTask: (taskId: number) => void;
  userName?: string;
}

const MaintenanceContent: React.FC<MaintenanceContentProps> = ({
  tasks,
  currentView,
  setCurrentView,
  currentMonth,
  setIsNewTaskDialogOpen,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  userName = 'Utilisateur'
}) => {
  const [searchParams] = useSearchParams();
  const highlightedTaskId = searchParams.get('highlight');
  const taskId = searchParams.get('taskId');
  
  const { 
    filteredTasks, 
    filterValue, 
    setFilterValue, 
    searchQuery, 
    setSearchQuery, 
    filterOptions 
  } = useFilter(tasks);
  
  // Handle highlighted task from notifications or direct link
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
        } else if (isFuture(task.dueDate)) {
          setCurrentView('upcoming');
        }
        
        // Notify the user that the task has been found with a more visually appealing toast
        toast.info(
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium">Tâche sélectionnée</div>
              <div className="text-sm text-muted-foreground">{task.title}</div>
            </div>
          </div>,
          {
            description: `Pour l'équipement : ${task.equipment}`,
            duration: 4000,
          }
        );
        
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
  
  // Organizing tasks into categories
  const upcomingTasks = filteredTasks.filter(task => 
    task.status !== 'completed' && isFuture(task.dueDate)
  );
  
  const todayTasks = filteredTasks.filter(task => 
    task.status !== 'completed' && isToday(task.dueDate)
  );
  
  const overdueTask = filteredTasks.filter(task => 
    task.status !== 'completed' && isPast(task.dueDate) && !isToday(task.dueDate)
  );
  
  const completedTasks = filteredTasks.filter(task => 
    task.status === 'completed'
  );
  
  const getCurrentTasks = () => {
    switch (currentView) {
      case 'today':
        return todayTasks;
      case 'overdue':
        return overdueTask;
      case 'completed':
        return completedTasks;
      case 'calendar':
        return filteredTasks;
      case 'upcoming':
      default:
        return upcomingTasks;
    }
  };
  
  // Stats for the current view
  const currentTasks = getCurrentTasks();
  const totalInView = currentTasks.length;
  
  // Empty state renderers
  const renderEmptyState = () => {
    switch (currentView) {
      case 'overdue':
        return (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune tâche en retard</h3>
            <p className="text-muted-foreground">
              Toutes vos tâches sont planifiées ou à jour.
            </p>
          </div>
        );
      case 'today':
        return (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Journée libre</h3>
            <p className="text-muted-foreground">
              Aucune tâche de maintenance n'est prévue pour aujourd'hui.
            </p>
          </div>
        );
      case 'upcoming':
        return (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune tâche à venir</h3>
            <p className="text-muted-foreground">
              Planifiez de nouvelles tâches de maintenance pour vos équipements.
            </p>
          </div>
        );
      case 'completed':
        return (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">Aucune tâche complétée</h3>
            <p className="text-muted-foreground">
              Terminez vos tâches de maintenance pour les voir apparaître ici.
            </p>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium mb-2">Chargement des tâches</h3>
            <p className="text-muted-foreground">
              Veuillez patienter pendant le chargement des données...
            </p>
          </div>
        );
    }
  };
  
  // Get view title and description
  const getViewInfo = () => {
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
  
  const viewInfo = getViewInfo();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <MaintenanceFilters 
          currentView={currentView}
          setCurrentView={setCurrentView}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterOptions={filterOptions}
          userName={userName}
        />
        
        <div className="mt-6">
          {currentView === 'calendar' ? (
            <BlurContainer raised gradient className="overflow-hidden">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  {viewInfo.icon}
                  <div>
                    <h2 className="text-xl font-medium">{viewInfo.title}</h2>
                    <p className="text-sm text-muted-foreground">{viewInfo.description}</p>
                  </div>
                </div>
                <CalendarView 
                  tasks={filteredTasks} 
                  currentMonth={currentMonth}
                  setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                  userName={userName}
                />
              </div>
            </BlurContainer>
          ) : (
            <Widget
              title={
                <div className="flex items-center">
                  {viewInfo.icon}
                  <span>{viewInfo.title}</span>
                </div>
              }
              subtitle={viewInfo.description}
              footer={
                totalInView > 0 && (
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Total: <b>{totalInView}</b> tâches</span>
                    <div className="flex items-center gap-2">
                      <span>Filtre: </span>
                      <span className="font-medium capitalize">{filterValue || 'Tous'}</span>
                    </div>
                  </div>
                )
              }
              className="overflow-hidden"
            >
              {totalInView > 0 ? (
                <MaintenanceTable 
                  tasks={getCurrentTasks()}
                  updateTaskStatus={updateTaskStatus}
                  updateTaskPriority={updateTaskPriority}
                  deleteTask={deleteTask}
                  userName={userName}
                  highlightedTaskId={highlightedTaskId || taskId ? parseInt(highlightedTaskId || taskId!) : undefined}
                />
              ) : (
                renderEmptyState()
              )}
            </Widget>
          )}
        </div>

        {/* Style for the highlight pulse effect */}
        <style>
          {`
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
          `}
        </style>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceContent;
