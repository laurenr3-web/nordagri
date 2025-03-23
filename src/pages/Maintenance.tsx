import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MaintenanceCalendar } from '@/components/dashboard/MaintenanceCalendar';
import { 
  Plus, 
  ChevronRight, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  User
} from 'lucide-react';

import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import { useMaintenanceSlice, MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

// Sample maintenance tasks
const maintenanceTasks = [
  {
    id: 1,
    title: 'Oil and Filter Change',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    dueDate: new Date(2023, 5, 15),
    estimatedDuration: 2,
    assignedTo: 'Michael Torres',
    notes: 'Use synthetic oil as specified in manual. Check fuel filters as well.'
  },
  {
    id: 2,
    title: 'Hydraulic System Inspection',
    equipment: 'Case IH Axial-Flow',
    equipmentId: 2,
    type: 'preventive',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date(2023, 5, 12),
    estimatedDuration: 3,
    assignedTo: 'David Chen',
    notes: 'Previous inspection showed minor leak in rear hydraulic line. Check carefully.'
  },
  {
    id: 3,
    title: 'Engine Repair',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    type: 'corrective',
    status: 'in-progress',
    priority: 'critical',
    dueDate: new Date(2023, 5, 10),
    estimatedDuration: 8,
    assignedTo: 'Sarah Johnson',
    notes: 'Engine overheating issue. Suspected damaged radiator and cooling system problems.'
  },
  {
    id: 4,
    title: 'Brake System Check',
    equipment: 'New Holland T6.180',
    equipmentId: 5,
    type: 'preventive',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(2023, 5, 8),
    completedDate: new Date(2023, 5, 8),
    estimatedDuration: 2,
    actualDuration: 1.5,
    assignedTo: 'Michael Torres',
    notes: 'Routine inspection completed. Brake pads still in good condition.'
  },
  {
    id: 5,
    title: 'Transmission Service',
    equipment: 'Fendt 942 Vario',
    equipmentId: 6,
    type: 'preventive',
    status: 'scheduled',
    priority: 'high',
    dueDate: new Date(2023, 5, 14),
    estimatedDuration: 4,
    assignedTo: 'David Chen',
    notes: 'Due to hours of operation. Follow service manual procedure F-942-TS.'
  },
  {
    id: 6,
    title: 'Tire Replacement',
    equipment: 'Massey Ferguson 8S.245',
    equipmentId: 4,
    type: 'corrective',
    status: 'scheduled',
    priority: 'medium',
    dueDate: new Date(2023, 5, 20),
    estimatedDuration: 3,
    assignedTo: 'Sarah Johnson',
    notes: 'Replace worn rear tires. New tires ordered and expected to arrive on June 18.'
  },
  {
    id: 7,
    title: 'Annual Service',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    type: 'preventive',
    status: 'scheduled',
    priority: 'medium',
    dueDate: new Date(2023, 6, 5),
    estimatedDuration: 6,
    assignedTo: 'Michael Torres',
    notes: 'Complete annual service according to manufacturer specifications.'
  },
  {
    id: 8,
    title: 'Electrical System Repair',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    type: 'corrective',
    status: 'pending-parts',
    priority: 'high',
    dueDate: new Date(2023, 5, 16),
    estimatedDuration: 4,
    assignedTo: 'David Chen',
    notes: 'Intermittent electrical issues. Waiting for diagnostic module to arrive.'
  }
];

// Convert tasks to calendar events
const maintenanceEvents = maintenanceTasks.map(task => ({
  id: task.id.toString(),
  title: task.title,
  date: task.dueDate,
  duration: task.estimatedDuration,
  priority: task.priority === 'critical' ? 'high' : 
           task.priority === 'low' ? 'low' : 
           'medium' as 'high' | 'medium' | 'low',
  equipment: task.equipment
}));

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
  
  // Helper functions for task filtering
  const getUpcomingTasks = () => {
    return tasks.filter(task => 
      task.status === 'scheduled' || task.status === 'pending-parts'
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };
  
  const getActiveTasks = () => {
    return tasks.filter(task => task.status === 'in-progress')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };
  
  const getCompletedTasks = () => {
    return tasks.filter(task => task.status === 'completed')
      .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0));
  };
  
  // Helper function to format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return (
          <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
            <Calendar size={12} />
            <span>Scheduled</span>
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
            <Clock size={12} />
            <span>In Progress</span>
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </Badge>
        );
      case 'pending-parts':
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>Pending Parts</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-secondary text-muted-foreground">
            {status}
          </Badge>
        );
    }
  };
  
  // Helper function for priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle size={12} />
            <span>Critical</span>
          </Badge>
        );
      case 'high':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle size={12} />
            <span>High</span>
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-harvest-100 text-harvest-800">Medium</Badge>
        );
      case 'low':
        return (
          <Badge className="bg-agri-100 text-agri-800">Low</Badge>
        );
      default:
        return (
          <Badge variant="outline">{priority}</Badge>
        );
    }
  };
  
  // Render task card
  const renderTaskCard = (task: MaintenanceTask) => (
    <BlurContainer 
      key={task.id}
      className="mb-4 animate-fade-in overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="font-medium text-lg leading-tight mb-1">{task.title}</h3>
            <p className="text-muted-foreground">{task.equipment}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {getStatusBadge(task.status)}
            {getPriorityBadge(task.priority)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Due Date</p>
            <p className="font-medium">{formatDate(task.dueDate)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Duration</p>
            <p className="font-medium">
              {task.status === 'completed' && task.actualDuration ? 
                `${task.actualDuration} hrs (Actual)` : 
                `${task.estimatedDuration} hrs (Est.)`
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Assigned To</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <p className="font-medium">{task.assignedTo}</p>
            </div>
          </div>
        </div>
        
        {task.notes && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm bg-secondary/50 p-3 rounded-md">{task.notes}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button variant="outline" className="gap-1">
            <span>Details</span>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </BlurContainer>
  );

  // Update the task events when tasks change
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
              <Tabs defaultValue="upcoming" className="mb-6" value={currentView} onValueChange={setCurrentView}>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming ({getUpcomingTasks().length})</TabsTrigger>
                  <TabsTrigger value="active">Active ({getActiveTasks().length})</TabsTrigger>
                  <TabsTrigger value="completed">Completed ({getCompletedTasks().length})</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming" className="mt-6">
                  {getUpcomingTasks().length > 0 ? (
                    getUpcomingTasks().map(renderTaskCard)
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
                  {getActiveTasks().length > 0 ? (
                    getActiveTasks().map(renderTaskCard)
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No active maintenance tasks at the moment.</p>
                    </BlurContainer>
                  )}
                </TabsContent>
                
                <TabsContent value="completed" className="mt-6">
                  {getCompletedTasks().length > 0 ? (
                    getCompletedTasks().map(renderTaskCard)
                  ) : (
                    <BlurContainer className="p-8 text-center">
                      <p className="text-muted-foreground">No completed maintenance tasks yet.</p>
                    </BlurContainer>
                  )}
                </TabsContent>
                
                <TabsContent value="calendar" className="mt-6">
                  <MaintenanceCalendar 
                    events={taskEvents}
                    month={currentMonth}
                    className="animate-scale-in"
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="space-y-6">
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">Upcoming Maintenance</h3>
                <div className="space-y-4">
                  {getUpcomingTasks().slice(0, 3).map((task, index) => (
                    <div key={task.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${task.priority === 'critical' ? 'bg-destructive/20 text-destructive' : 
                          task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                          'bg-secondary text-muted-foreground'}`}>
                        {task.type === 'preventive' ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground mb-1">{task.equipment}</p>
                        <p className="text-xs">Due: {formatDate(task.dueDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </BlurContainer>
              
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">Maintenance by Type</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Preventive</span>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.type === 'preventive').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Corrective</span>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.type === 'corrective').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Condition-based</span>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.type === 'condition-based').length || 0}</span>
                  </div>
                </div>
              </BlurContainer>
              
              <BlurContainer className="p-4">
                <h3 className="font-medium mb-4">Maintenance by Priority</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-destructive"></div>
                      <span>Critical</span>
                    </div>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.priority === 'critical').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span>High</span>
                    </div>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.priority === 'high').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-harvest-500"></div>
                      <span>Medium</span>
                    </div>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.priority === 'medium').length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-agri-500"></div>
                      <span>Low</span>
                    </div>
                    <span className="font-medium">{maintenanceTasks.filter(t => t.priority === 'low').length || 0}</span>
                  </div>
                </div>
              </BlurContainer>
            </div>
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
