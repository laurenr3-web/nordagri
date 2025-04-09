
import React from 'react';
import { Widget } from '@/components/ui/widget';
import { MaintenanceTable } from '@/components/maintenance/MaintenanceTable';
import EmptyStateDisplay from '@/components/maintenance/EmptyStateDisplay';
import { MaintenanceStatus, MaintenancePriority, MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { getViewInfo } from '@/components/maintenance/utils/MaintenanceViewUtils';

interface MaintenanceViewContentProps {
  currentView: string;
  tasks: MaintenanceTask[];
  highlightedTaskId?: number;
  updateTaskStatus: (taskId: number, status: MaintenanceStatus) => void;
  updateTaskPriority: (taskId: number, priority: MaintenancePriority) => void;
  deleteTask: (taskId: number) => void;
  userName?: string;
  filterValue: string;
}

const MaintenanceViewContent: React.FC<MaintenanceViewContentProps> = ({
  currentView,
  tasks,
  highlightedTaskId,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  userName,
  filterValue
}) => {
  const viewInfo = getViewInfo(currentView);
  const totalInView = tasks.length;
  
  return (
    <Widget
      title={
        <div className="flex items-center">
          {viewInfo.icon}
          <span>{viewInfo.title}</span>
        </div>
      }
      subtitle={viewInfo.description}
      footer={
        totalInView > 0 && (
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Total: <b>{totalInView}</b> tâches</span>
            <div className="flex items-center gap-2">
              <span>Filtre: </span>
              <span className="font-medium capitalize">{filterValue || 'Tous'}</span>
            </div>
          </div>
        )
      }
      className="overflow-hidden"
    >
      {totalInView > 0 ? (
        <MaintenanceTable 
          tasks={tasks}
          updateTaskStatus={updateTaskStatus}
          updateTaskPriority={updateTaskPriority}
          deleteTask={deleteTask}
          userName={userName}
          highlightedTaskId={highlightedTaskId}
        />
      ) : (
        <EmptyStateDisplay currentView={currentView} />
      )}
    </Widget>
  );
};

export default MaintenanceViewContent;
