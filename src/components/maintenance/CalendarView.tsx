
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CalendarViewProps {
  tasks: MaintenanceTask[];
  currentMonth: Date;
  setIsNewTaskDialogOpen: (open: boolean) => void;
  userName?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  currentMonth,
  setIsNewTaskDialogOpen,
  userName = 'Utilisateur'
}) => {
  const [month, setMonth] = useState(currentMonth);
  
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const handlePrevMonth = () => {
    setMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const handleNextMonth = () => {
    setMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  const handleAddTask = (date: Date) => {
    setIsNewTaskDialogOpen(true);
  };
  
  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => isSameDay(task.dueDate, day));
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">
            {format(month, 'MMMM yyyy', { locale: fr })}
          </h3>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => handleAddTask(new Date())}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle tâche
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-muted">
        {/* Calendar header - days of the week */}
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => (
          <div key={day} className="p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}
        
        {/* Days of the month */}
        {monthDays.map((day, i) => {
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, month);
          
          return (
            <div
              key={day.toString()}
              className={`min-h-[120px] p-2 relative ${
                !isCurrentMonth ? 'bg-muted/50 text-muted-foreground' : 
                isToday(day) ? 'bg-blue-50' : 'bg-card'
              }`}
            >
              <div className="flex justify-between">
                <span className={`text-sm ${isToday(day) ? 'font-bold' : ''}`}>
                  {format(day, 'd')}
                </span>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleAddTask(day)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded truncate"
                  >
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${getPriorityColor(task.priority)}`}
                    >
                      {task.title}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default CalendarView;
