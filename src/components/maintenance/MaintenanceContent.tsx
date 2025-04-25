
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { MaintenanceStatus, MaintenancePriority, MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceFilters } from '@/components/maintenance/MaintenanceFilters';
import { Calendar as CalendarIcon } from 'lucide-react';
import CalendarView from '@/components/maintenance/CalendarView';
import { useMaintenanceContent } from './useMaintenanceContent';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const {
    filterValue, setFilterValue, searchQuery, setSearchQuery,
    filterOptions, highlightedTaskId, getCurrentTasks
  } = useMaintenanceContent(tasks, setCurrentView, userName);

  return (
    <div className="w-full max-w-7xl mx-auto overflow-hidden">
      <div className="p-4 space-y-4">
        <MaintenanceFilters 
          currentView={currentView}
          setCurrentView={setCurrentView}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterOptions={filterOptions}
          userName={userName}
          className="w-full"
        />

        <div className="mt-4 space-y-4">
          {currentView === 'calendar' ? (
            <div className="rounded-lg overflow-hidden">
              <CalendarView 
                tasks={getCurrentTasks(currentView)}
                currentMonth={currentMonth}
                setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                userName={userName}
              />
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <h2 className="text-lg font-semibold truncate">
                    {currentView === 'today' ? 'Tâches du jour' : 
                     currentView === 'overdue' ? 'Tâches en retard' :
                     currentView === 'completed' ? 'Tâches terminées' : 'Tâches à venir'}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  {currentView === 'today' ? format(new Date(), 'd MMMM yyyy', { locale: fr }) :
                   currentView === 'overdue' ? "Tâches dont l'échéance est dépassée" :
                   currentView === 'completed' ? "Historique des tâches terminées" : "Tâches planifiées à venir"}
                </p>
              </div>

              <ScrollArea className="relative">
                <div className="p-4">
                  <MaintenanceTable 
                    tasks={getCurrentTasks(currentView)}
                    updateTaskStatus={updateTaskStatus}
                    updateTaskPriority={updateTaskPriority}
                    deleteTask={deleteTask}
                    userName={userName}
                    highlightedTaskId={highlightedTaskId ? parseInt(highlightedTaskId) : undefined}
                  />
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceContent;
