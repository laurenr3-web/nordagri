
import React, { useState } from 'react';
import { useMaintenanceSlice } from '@/hooks/maintenance/maintenanceSlice';
import { maintenanceTasks } from '@/data/maintenanceData';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';

const Maintenance = () => {
  const [currentView, setCurrentView] = useState('upcoming');
  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const {
    tasks, 
    setTasks,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    handleAddTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  } = useMaintenanceSlice(maintenanceTasks);

  // Handle opening dialog with a preselected date
  const handleOpenNewTaskDialog = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsNewTaskDialogOpen(open);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-6 pb-16 px-4 sm:px-8 md:px-6 lg:px-8 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <MaintenanceHeader 
            setIsNewTaskDialogOpen={setIsNewTaskDialogOpen} 
          />
          
          <MaintenanceContent 
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
      </div>
      
      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={handleOpenNewTaskDialog}
        onSubmit={handleAddTask}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Maintenance;
