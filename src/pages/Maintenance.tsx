
import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { useMaintenanceSlice } from '@/hooks/maintenance/maintenanceSlice';
import { maintenanceTasks } from '@/data/maintenanceData';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import TaskTabs from '@/components/maintenance/TaskTabs';
import MaintenanceStats from '@/components/maintenance/MaintenanceStats';
import { getUpcomingTasks } from '@/components/maintenance/MaintenanceUtils';

const Maintenance = () => {
  const [currentView, setCurrentView] = useState('upcoming');
  const [currentMonth] = useState(new Date());
  
  const {
    tasks, 
    setTasks,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    handleAddTask
  } = useMaintenanceSlice(maintenanceTasks);
  
  const upcomingTasks = getUpcomingTasks(tasks);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-6 pb-16 pl-4 pr-4 sm:pl-8 sm:pr-8 md:pl-12 md:pr-12 ml-0 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="chip chip-accent mb-2">Maintenance Management</div>
                <h1 className="text-3xl font-medium tracking-tight mb-1">Maintenance Planner</h1>
                <p className="text-muted-foreground">
                  Schedule and track maintenance activities for your equipment
                </p>
              </div>
              
              <div className="mt-4 sm:mt-0">
                <Button className="gap-2" onClick={() => setIsNewTaskDialogOpen(true)}>
                  <Plus size={16} />
                  <span>New Task</span>
                </Button>
              </div>
            </div>
          </header>
          
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
        </div>
      </div>
      
      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onSubmit={handleAddTask}
      />
    </div>
  );
};

export default Maintenance;
