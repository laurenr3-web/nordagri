
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { formatDate } from './MaintenanceUtils';

interface MaintenanceStatsProps {
  tasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
}

const MaintenanceStats: React.FC<MaintenanceStatsProps> = ({ tasks, upcomingTasks }) => {
  return (
    <div className="space-y-6">
      <BlurContainer className="p-4">
        <h3 className="font-medium mb-4">Upcoming Maintenance</h3>
        <div className="space-y-4">
          {upcomingTasks.slice(0, 3).map((task) => (
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
            <span className="font-medium">{tasks.filter(t => t.type === 'preventive').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Corrective</span>
            <span className="font-medium">{tasks.filter(t => t.type === 'corrective').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Condition-based</span>
            <span className="font-medium">{tasks.filter(t => t.type === 'condition-based').length || 0}</span>
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
            <span className="font-medium">{tasks.filter(t => t.priority === 'critical').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span>High</span>
            </div>
            <span className="font-medium">{tasks.filter(t => t.priority === 'high').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-harvest-500"></div>
              <span>Medium</span>
            </div>
            <span className="font-medium">{tasks.filter(t => t.priority === 'medium').length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-agri-500"></div>
              <span>Low</span>
            </div>
            <span className="font-medium">{tasks.filter(t => t.priority === 'low').length || 0}</span>
          </div>
        </div>
      </BlurContainer>
    </div>
  );
};

export default MaintenanceStats;
