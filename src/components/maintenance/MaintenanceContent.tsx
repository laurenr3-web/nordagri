
import React, { useEffect } from 'react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceFilters } from '@/components/maintenance/MaintenanceFilters';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useFilter } from '@/hooks/maintenance/useFilter';
import CalendarView from '@/components/maintenance/CalendarView';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

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
  
  const { 
    filteredTasks, 
    filterValue, 
    setFilterValue, 
    searchQuery, 
    setSearchQuery, 
    filterOptions 
  } = useFilter(tasks);
  
  // Handle highlighted task from notifications
  useEffect(() => {
    if (highlightedTaskId) {
      const taskId = parseInt(highlightedTaskId);
      const task = tasks.find(t => t.id === taskId);
      
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
        
        // Notify the user that the task has been found
        toast.info(`Tâche sélectionnée : ${task.title}`, {
          description: `Pour l'équipement : ${task.equipment}`,
        });
      }
    }
  }, [highlightedTaskId, tasks, setCurrentView]);
  
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
  
  return (
    <>
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
          <CalendarView 
            tasks={filteredTasks} 
            currentMonth={currentMonth}
            setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
            userName={userName}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                {currentView === 'today' ? 'Tâches du jour' : 
                 currentView === 'overdue' ? 'Tâches en retard' :
                 currentView === 'completed' ? 'Tâches terminées' : 'Tâches à venir'}
              </CardTitle>
              <CardDescription>
                {currentView === 'today' ? `${format(new Date(), 'd MMMM yyyy', { locale: fr })}` :
                 currentView === 'overdue' ? 'Tâches dont l\'échéance est dépassée' :
                 currentView === 'completed' ? 'Historique des tâches terminées' : 'Tâches planifiées à venir'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MaintenanceTable 
                tasks={getCurrentTasks()}
                updateTaskStatus={updateTaskStatus}
                updateTaskPriority={updateTaskPriority}
                deleteTask={deleteTask}
                userName={userName}
                highlightedTaskId={highlightedTaskId ? parseInt(highlightedTaskId) : undefined}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default MaintenanceContent;
