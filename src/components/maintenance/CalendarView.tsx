
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, getDay, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import TaskDetailsDialog from '@/components/maintenance/dialogs/TaskDetailsDialog';

interface CalendarViewProps {
  tasks: MaintenanceTask[];
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
  userName?: string;
  updateTaskStatus?: (taskId: number, status: any) => void;
  updateTaskPriority?: (taskId: number, priority: any) => void;
  deleteTask?: (taskId: number) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  currentMonth,
  setIsNewTaskDialogOpen,
  userName = 'Utilisateur',
  updateTaskStatus,
  updateTaskPriority,
  deleteTask
}) => {
  const [month, setMonth] = useState(currentMonth);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with Monday
  const firstDayOfWeek = getDay(monthStart);
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const handlePrevMonth = () => {
    setMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };
  
  const handleNextMonth = () => {
    setMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };
  
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(task.dueDate, day));
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-destructive/20 text-destructive border-destructive/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const handleTaskClick = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-3 flex justify-between items-center border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-sm sm:text-lg font-semibold capitalize">
              {format(month, 'MMMM yyyy', { locale: fr })}
            </h3>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => setIsNewTaskDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Nouvelle tâche</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
        
        {/* Days header */}
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
            <div key={i} className="py-2 text-center text-[11px] font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Padding for days before month start */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[60px] sm:min-h-[90px] border-b border-r bg-muted/20" />
          ))}
          
          {monthDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const today = isToday(day);
            
            return (
              <div
                key={day.toString()}
                className={`min-h-[60px] sm:min-h-[90px] border-b border-r p-1 relative ${
                  today ? 'bg-primary/5' : 'bg-card'
                }`}
              >
                {/* Day number + add button */}
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-xs font-medium leading-none ${
                    today ? 'bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center' : ''
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <button
                    onClick={() => setIsNewTaskDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground h-4 w-4 flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                
                {/* Tasks */}
                <div className="space-y-0.5 overflow-y-auto max-h-[36px] sm:max-h-[60px]">
                  {dayTasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className={`w-full text-left text-[9px] sm:text-[10px] leading-tight px-1 py-0.5 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(task.priority)}`}
                    >
                      <span className="line-clamp-1">{task.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <TaskDetailsDialog
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onStatusChange={updateTaskStatus}
        onPriorityChange={updateTaskPriority}
        onDeleteTask={deleteTask}
      />
    </>
  );
};

export default CalendarView;
