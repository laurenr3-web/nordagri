
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MaintenanceTask, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { formatDate, getStatusBadge, getPriorityBadge } from '../MaintenanceUtils';

interface MaintenanceByTypeProps {
  tasks: MaintenanceTask[];
  onViewDetails: (task: MaintenanceTask) => void;
}

const MaintenanceByType: React.FC<MaintenanceByTypeProps> = ({ tasks, onViewDetails }) => {
  // Group tasks by type
  const tasksByType = tasks.reduce((acc, task) => {
    if (!acc[task.type]) {
      acc[task.type] = [];
    }
    acc[task.type].push(task);
    return acc;
  }, {} as Record<MaintenanceType, MaintenanceTask[]>);

  // Get unique types
  const types = Object.keys(tasksByType) as MaintenanceType[];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {types.map((type) => (
        <Card key={type} className="overflow-hidden">
          <CardHeader className="bg-secondary/30">
            <CardTitle className="capitalize text-lg">{type} Maintenance</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksByType[type].map((task) => (
                  <TableRow 
                    key={task.id} 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => onViewDetails(task)}
                  >
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.equipment}</TableCell>
                    <TableCell>{formatDate(task.dueDate)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{task.assignedTo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MaintenanceByType;
