
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { 
  MaintenanceTask, 
  MaintenancePriority, 
  MaintenanceStatus 
} from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import TaskCard from './TaskCard';
import TaskDetailsDialog from './dialogs/TaskDetailsDialog';
import { getUpcomingTasks, getActiveTasks, getCompletedTasks } from './MaintenanceUtils';
import MaintenanceByType from './views/MaintenanceByType';
import MaintenanceByPriority from './views/MaintenanceByPriority';

interface TaskTabsProps {
  tasks: MaintenanceTask[];
  currentView: string;
  setCurrentView: (view: string) => void;
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
  updateTaskStatus: (taskId: number, status: MaintenanceStatus) => void;
  updateTaskPriority: (taskId: number, priority: MaintenancePriority) => void;
  deleteTask: (taskId: number) => void;
}

const TaskTabs: React.FC<TaskTabsProps> = ({ 
  tasks, 
  currentView, 
  setCurrentView,
  currentMonth,
  setIsNewTaskDialogOpen,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask
}) => {
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  const upcomingTasks = getUpcomingTasks(tasks);
  const activeTasks = getActiveTasks(tasks);
  const completedTasks = getCompletedTasks(tasks);
  
  const handleViewDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDetailsDialogOpen(true);
  };
  
  const handleAddTask = (date?: Date) => {
    setSelectedDate(date);
    setIsNewTaskDialogOpen(true);
  };
  
  // Convert tasks to calendar events
  const taskEvents = tasks.map(task => ({
    id: task.id.toString(),
    title: task.title,
    date: task.dueDate,
    duration: task.estimatedDuration,
    priority: task.priority === 'critical' ? 'high' : 
             task.priority === 'low' ? 'low' : 
             'medium' as 'high' | 'medium' | 'low',
    equipment: task.equipment
  }));

  return (
    <>
      <Tabs defaultValue="upcoming" className="mb-6" value={currentView} onValueChange={setCurrentView}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="by-type">By Type</TabsTrigger>
          <TabsTrigger value="by-priority">By Priority</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6">
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewDetails={handleViewDetails} 
              />
            ))
          ) : (
            <BlurContainer className="p-8 text-center">
              <p className="text-muted-foreground">No upcoming maintenance tasks scheduled.</p>
              <Button variant="link" className="mt-2" onClick={() => setIsNewTaskDialogOpen(true)}>
                Schedule new task
              </Button>
            </BlurContainer>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="mt-6">
          {activeTasks.length > 0 ? (
            activeTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewDetails={handleViewDetails} 
              />
            ))
          ) : (
            <BlurContainer className="p-8 text-center">
              <p className="text-muted-foreground">No active maintenance tasks at the moment.</p>
            </BlurContainer>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {completedTasks.length > 0 ? (
            completedTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onViewDetails={handleViewDetails} 
              />
            ))
          ) : (
            <BlurContainer className="p-8 text-center">
              <p className="text-muted-foreground">No completed maintenance tasks yet.</p>
            </BlurContainer>
          )}
        </TabsContent>

        <TabsContent value="by-type" className="mt-6">
          <MaintenanceByType 
            tasks={tasks} 
            onViewDetails={handleViewDetails} 
          />
        </TabsContent>

        <TabsContent value="by-priority" className="mt-6">
          <MaintenanceByPriority 
            tasks={tasks} 
            onViewDetails={handleViewDetails} 
          />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <MaintenanceCalendar 
            events={taskEvents}
            month={currentMonth}
            className="animate-scale-in"
            onAddTask={handleAddTask}
          />
        </TabsContent>
      </Tabs>
      
      <TaskDetailsDialog 
        task={selectedTask}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onStatusChange={updateTaskStatus}
        onPriorityChange={updateTaskPriority}
        onDeleteTask={deleteTask}
      />
    </>
  );
};

export default TaskTabs;
