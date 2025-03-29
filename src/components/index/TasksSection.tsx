
import React from 'react';
import { Button } from '@/components/ui/button';
import { BlurContainer } from '@/components/ui/blur-container';
import { DashboardSection } from '@/components/dashboard/DashboardSection';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskItem } from '@/hooks/dashboard/useDashboardData';

interface TasksSectionProps {
  tasks: TaskItem[];
  onAddClick: () => void;
}

const TasksSection: React.FC<TasksSectionProps> = ({ tasks, onAddClick }) => {
  return (
    <DashboardSection 
      title="Upcoming Tasks" 
      subtitle="Scheduled maintenance" 
      action={
        <Button variant="outline" size="sm" onClick={onAddClick}>
          Add Task
        </Button>
      }
    >
      <BlurContainer className="divide-y animate-fade-in delay-100">
        {tasks.map(task => (
          <div key={task.id} className="p-4 hover:bg-secondary/40 transition-colors">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="font-medium text-sm">{task.title}</h4>
              <span 
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full", 
                  task.priority === 'high' ? "bg-red-100 text-red-800" : 
                  task.priority === 'medium' ? "bg-harvest-100 text-harvest-800" : 
                  "bg-agri-100 text-agri-800"
                )}
              >
                {task.priority}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{task.equipment}</p>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <Clock size={14} className="mr-1" />
                <span>Due: {task.due}</span>
              </div>
              <span className="text-muted-foreground">{task.assignee}</span>
            </div>
          </div>
        ))}
      </BlurContainer>
    </DashboardSection>
  );
};

export default TasksSection;
