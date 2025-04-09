
import React from 'react';
import { Card } from '@/components/ui/card';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceFilters } from '@/components/maintenance/MaintenanceFilters';
import CalendarView from '@/components/maintenance/CalendarView';
import { useSearchParams } from 'react-router-dom';
import { BlurContainer } from '@/components/ui/blur-container';
import { motion, AnimatePresence } from 'framer-motion';
import { useFilter } from '@/hooks/maintenance/useFilter';
import { useHighlightedTask } from '@/hooks/maintenance/useHighlightedTask';
import MaintenanceViewContent from '@/components/maintenance/MaintenanceViewContent';
import { categorizeMaintenanceTasks, highlightPulseStyle } from '@/components/maintenance/utils/MaintenanceViewUtils';

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
  
  // Gérer la tâche mise en évidence depuis les notifications ou un lien direct
  const { highlightedTaskId: highlightedId } = useHighlightedTask(
    tasks, 
    highlightedTaskId, 
    taskId, 
    setCurrentView
  );
  
  // Catégoriser les tâches
  const { upcomingTasks, todayTasks, overdueTask, completedTasks } = 
    categorizeMaintenanceTasks(filteredTasks);
  
  // Obtenir les tâches actuelles en fonction de la vue
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
  
  const currentTasks = getCurrentTasks();
  
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
                  <div>
                    <h2 className="text-xl font-medium">Calendrier de maintenance</h2>
                    <p className="text-sm text-muted-foreground">Vue mensuelle des tâches planifiées</p>
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
            <MaintenanceViewContent 
              currentView={currentView}
              tasks={currentTasks}
              highlightedTaskId={highlightedId}
              updateTaskStatus={updateTaskStatus}
              updateTaskPriority={updateTaskPriority}
              deleteTask={deleteTask}
              userName={userName}
              filterValue={filterValue}
            />
          )}
        </div>

        {/* Style pour l'effet de pulsation de surbrillance */}
        <style dangerouslySetInnerHTML={{ __html: highlightPulseStyle }} />
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceContent;
