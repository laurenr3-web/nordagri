
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

interface MaintenanceCalendarTableProps {
  tasks: MaintenanceTask[];
  loading: boolean;
  formatDate: (date: Date) => string;
  getStatusBadge: (status: string) => React.ReactNode;
  getPriorityColor: (priority: string) => string;
  handleViewQuote: (taskId: number) => void;
  handleChangeStatus: (taskId: number, newStatus: string) => void;
  handleAddTask: () => void;
}

const MaintenanceCalendarTable: React.FC<MaintenanceCalendarTableProps> = ({
  tasks,
  loading,
  formatDate,
  getStatusBadge,
  getPriorityColor,
  handleViewQuote,
  handleChangeStatus,
  handleAddTask
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Aucune tâche de maintenance n'a été trouvée pour cet équipement</p>
        <Button variant="outline" className="mt-4" onClick={handleAddTask}>
          Planifier une maintenance
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tâche</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Priorité</TableHead>
          <TableHead>Date prévue</TableHead>
          <TableHead>Heures moteur</TableHead>
          <TableHead>Assigné à</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>
              {task.type === 'preventive' ? 'Préventive' : 
               task.type === 'corrective' ? 'Corrective' : 
               task.type === 'condition-based' ? 'Conditionnelle' : task.type}
            </TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority === 'critical' ? 'Critique' :
                 task.priority === 'high' ? 'Haute' :
                 task.priority === 'medium' ? 'Moyenne' :
                 task.priority === 'low' ? 'Basse' : task.priority}
              </Badge>
            </TableCell>
            <TableCell>{formatDate(task.dueDate)}</TableCell>
            <TableCell>{task.engineHours}h</TableCell>
            <TableCell>{task.assignedTo || '-'}</TableCell>
            <TableCell>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleViewQuote(task.id)}
                  title="Voir le devis"
                >
                  <FileText className="h-4 w-4 text-blue-500" />
                </Button>
                
                {task.status !== 'completed' && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleChangeStatus(task.id, 'completed')}
                    title="Marquer comme terminé"
                  >
                    <Wrench className="h-4 w-4 text-green-500" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MaintenanceCalendarTable;
