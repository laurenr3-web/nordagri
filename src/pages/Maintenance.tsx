
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { maintenanceTasks } from '@/data/maintenanceData';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';

const Maintenance = () => {
  // Always initialize all hooks first, before any conditional logic
  const [currentView, setCurrentView] = useState('upcoming');
  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  
  const {
    tasks, 
    isLoading,
    isError,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  } = useTasksManager(maintenanceTasks);

  // Handle opening dialog with a preselected date
  const handleOpenNewTaskDialog = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsNewTaskDialogOpen(open);
  };

  const handleAddTask = (formData: any) => {
    console.log('Adding task in Maintenance component:', formData);
    return addTask(formData);
  };

  useEffect(() => {
    console.log('Maintenance component loaded with tasks:', tasks);
  }, [tasks]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
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
        </div>
      </div>
      
      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={handleOpenNewTaskDialog}
        onSubmit={handleAddTask}
        initialDate={selectedDate}
      />
    </SidebarProvider>
  );
};

export default Maintenance;
