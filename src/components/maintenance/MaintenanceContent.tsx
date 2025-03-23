
import React from 'react';
import { 
  MaintenanceTask, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '@/hooks/maintenance/maintenanceSlice';
import TaskTabs from './TaskTabs';
import MaintenanceStats from './MaintenanceStats';
import MaintenanceNavigation from './MaintenanceNavigation';
import { getUpcomingTasks } from './MaintenanceUtils';

interface MaintenanceContentProps {
  tasks: MaintenanceTask[];
  currentView: string;
  setCurrentView: (view: string) => void;
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
  updateTaskStatus: (taskId: number, status: MaintenanceStatus) => void;
  updateTaskPriority: (taskId: number, priority: MaintenancePriority) => void;
  deleteTask: (taskId: number) => void;
  isMobile?: boolean;
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
  isMobile = false
}) => {
  const upcomingTasks = getUpcomingTasks(tasks);

  return (
    <div className="w-full max-w-full">
      <MaintenanceNavigation
        currentView={currentView}
        setCurrentView={setCurrentView}
        isMobile={isMobile}
      />
    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-2">
          <TaskTabs 
            tasks={tasks}
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentMonth={currentMonth}
            setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
            updateTaskStatus={updateTaskStatus}
            updateTaskPriority={updateTaskPriority}
            deleteTask={deleteTask}
          />
        </div>
        
        <MaintenanceStats 
          tasks={tasks}
          upcomingTasks={upcomingTasks}
        />
      </div>
    </div>
  );
};

export default MaintenanceContent;
