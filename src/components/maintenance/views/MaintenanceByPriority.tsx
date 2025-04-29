
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MaintenanceTask, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { formatDate, getStatusBadge } from '../MaintenanceUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MaintenanceByPriorityProps {
  tasks: MaintenanceTask[];
  onViewDetails: (task: MaintenanceTask) => void;
}

const MaintenanceByPriority: React.FC<MaintenanceByPriorityProps> = ({ tasks, onViewDetails }) => {
  // Define the priority order
  const priorityOrder: MaintenancePriority[] = ['critical', 'high', 'medium', 'low'];
  
  // Group tasks by priority
  const tasksByPriority = tasks.reduce((acc, task) => {
    if (!acc[task.priority]) {
      acc[task.priority] = [];
    }
    acc[task.priority].push(task);
    return acc;
  }, {} as Record<MaintenancePriority, MaintenanceTask[]>);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {priorityOrder.map((priority) => {
        // Skip priorities with no tasks
        if (!tasksByPriority[priority] || tasksByPriority[priority].length === 0) {
          return null;
        }
        
        const priorityColor = priority === 'critical' ? 'bg-red-50 border-red-200' : 
                             priority === 'high' ? 'bg-orange-50 border-orange-200' :
                             priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                             'bg-green-50 border-green-200';
                             
        return (
          <Card key={priority} className={`overflow-hidden border ${priorityColor}`}>
            <CardHeader className={`${priorityColor}`}>
              <CardTitle className="capitalize text-lg">{priority} Priority</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full overflow-auto">
                <div className="min-w-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Equipment</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasksByPriority[priority].map((task) => (
                        <TableRow 
                          key={task.id} 
                          className="cursor-pointer hover:bg-muted"
                          onClick={() => onViewDetails(task)}
                        >
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>{task.equipment}</TableCell>
                          <TableCell className="capitalize">{task.type}</TableCell>
                          <TableCell>{formatDate(task.dueDate)}</TableCell>
                          <TableCell>{getStatusBadge(task.status)}</TableCell>
                          <TableCell>{task.assignedTo}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default MaintenanceByPriority;
