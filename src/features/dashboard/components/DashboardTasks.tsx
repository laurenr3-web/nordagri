
import React from 'react';
import { DashboardSection } from '@/components/dashboard/sections/DashboardSection';

interface UpcomingTask {
  id: number;
  title: string;
  description: string;
  dueDate: Date;
}

interface DashboardTasksProps {
  tasks: UpcomingTask[];
  isEditing: boolean;
  onAddTask: () => void;
}

export const DashboardTasks: React.FC<DashboardTasksProps> = ({
  tasks,
  isEditing,
  onAddTask
}) => {
  return (
    <DashboardSection
      id="tasks"
      title="Tâches à venir"
      subtitle="Vos prochaines tâches planifiées"
      isEditing={isEditing}
      actionLabel="Ajouter"
      onAction={onAddTask}
    >
      <div className="space-y-4">
        {tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="border rounded-md p-3">
            <h4 className="font-medium">{task.title}</h4>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="text-xs text-muted-foreground mt-1">
              {task.dueDate.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </DashboardSection>
  );
};
