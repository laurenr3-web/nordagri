
import React from 'react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import TaskTabs from './TaskTabs';
import MaintenanceStats from './MaintenanceStats';
import { getUpcomingTasks } from './MaintenanceUtils';

interface MaintenanceContentProps {
  tasks: MaintenanceTask[];
  currentView: string;
  setCurrentView: (view: string) => void;
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
}

const MaintenanceContent: React.FC<MaintenanceContentProps> = ({
  tasks,
  currentView,
  setCurrentView,
  currentMonth,
  setIsNewTaskDialogOpen
}) => {
  const upcomingTasks = getUpcomingTasks(tasks);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <TaskTabs 
          tasks={tasks}
          currentView={currentView}
          setCurrentView={setCurrentView}
          currentMonth={currentMonth}
          setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
        />
      </div>
      
      <MaintenanceStats 
        tasks={tasks}
        upcomingTasks={upcomingTasks}
      />
    </div>
  );
};

export default MaintenanceContent;
