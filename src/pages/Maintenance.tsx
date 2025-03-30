
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { maintenanceTasks } from '@/data/maintenanceData';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import ErrorBoundary from '@/components/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar/sidebar-context';
import { Sidebar } from '@/components/ui/sidebar/sidebar';
import { useMaintenanceRealtime } from '@/hooks/maintenance/useMaintenanceRealtime';
import { cleanupOrphanedPortals } from '@/utils/dom-helpers';

const Maintenance = () => {
  // Utiliser des références stables pour éviter les re-renders inutiles
  const [currentView, setCurrentView] = React.useState('upcoming');
  const [currentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = React.useState(false);
  
  // Initialize realtime subscription
  useMaintenanceRealtime();
  
  const {
    tasks, 
    isLoading,
    isError,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  } = useTasksManager(maintenanceTasks);

  // Réaliser le nettoyage des portails orphelins au chargement et déchargement
  React.useEffect(() => {
    // Nettoyer les portails orphelins au chargement
    cleanupOrphanedPortals();
    
    // Nettoyer les portails orphelins au déchargement
    return () => {
      cleanupOrphanedPortals();
    };
  }, []);

  // Handle open/close new task dialog avec useCallback pour stabilité des refs
  const handleOpenNewTaskDialog = React.useCallback((open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsNewTaskDialogOpen(open);
  }, []);

  // Handle adding a task avec useCallback pour stabilité des refs
  const handleAddTask = React.useCallback((formData: any) => {
    console.log('Adding task in Maintenance component:', formData);
    return addTask(formData);
  }, [addTask]);

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen w-full bg-background">
        <SidebarProvider defaultOpen={true}>
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
        </SidebarProvider>
          
        {/* Conditionally render dialog to prevent unmounting issues */}
        {isNewTaskDialogOpen && (
          <NewTaskDialog 
            open={isNewTaskDialogOpen}
            onOpenChange={handleOpenNewTaskDialog}
            onSubmit={handleAddTask}
            initialDate={selectedDate}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Maintenance;
