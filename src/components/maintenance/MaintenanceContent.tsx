
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { MaintenanceStatus, MaintenancePriority, MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceFilters } from '@/components/maintenance/MaintenanceFilters';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarView from '@/components/maintenance/CalendarView';
import { useMaintenanceContent } from './useMaintenanceContent';

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

/** 
 * UI principal Maintenance. Ne gère plus la logique métier, seulement l’affichage.
 */
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
  const {
    filterValue, setFilterValue, searchQuery, setSearchQuery,
    filterOptions, highlightedTaskId, getCurrentTasks
  } = useMaintenanceContent(tasks, setCurrentView, userName);

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
      <div className="mt-md">
        {currentView === 'calendar' ? (
          <CalendarView 
            tasks={getCurrentTasks(currentView)}
            currentMonth={currentMonth}
            setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
            userName={userName}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-xs text-lg md:text-xl">
                <CalendarIcon className="mr-xs h-5 w-5" />
                {currentView === 'today' ? 'Tâches du jour' : 
                 currentView === 'overdue' ? 'Tâches en retard' :
                 currentView === 'completed' ? 'Tâches terminées' : 'Tâches à venir'}
              </CardTitle>
              <CardDescription>
                {currentView === 'today' ? format(new Date(), 'd MMMM yyyy', { locale: fr }) :
                  currentView === 'overdue' ? "Tâches dont l'échéance est dépassée" :
                  currentView === 'completed' ? "Historique des tâches terminées" : "Tâches planifiées à venir"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-md">
              <MaintenanceTable 
                tasks={getCurrentTasks(currentView)}
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
