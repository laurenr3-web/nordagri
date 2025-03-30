
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarPlus, 
  Loader2, 
  PenLine,
  Trash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

interface MaintenanceCalendarTableProps {
  tasks: MaintenanceTask[];
  loading: boolean;
  formatDate: (date: Date) => string;
  getStatusBadge: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  handleChangeStatus: (taskId: number, newStatus: string) => void;
  handleAddTask: () => void;
  handleDeleteTask: (taskId: number) => void;
}

const MaintenanceCalendarTable: React.FC<MaintenanceCalendarTableProps> = ({
  tasks,
  loading,
  formatDate,
  getStatusBadge,
  getPriorityColor,
  handleChangeStatus,
  handleAddTask,
  handleDeleteTask
}) => {
  return (
    <div>
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <p className="mb-4 text-muted-foreground">Aucune tâche de maintenance programmée</p>
          <Button onClick={handleAddTask}>
            <CalendarPlus className="h-4 w-4 mr-2" />
            Planifier une maintenance
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Durée est.</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map(task => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">
                  {task.title}
                </TableCell>
                <TableCell>{task.type}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(new Date(task.dueDate))}</TableCell>
                <TableCell>{task.estimatedDuration}h</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'scheduled')}>
                        Marquer comme planifiée
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in-progress')}>
                        Marquer comme en cours
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'completed')}>
                        Marquer comme terminée
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'pending-parts')}>
                        En attente de pièces
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'canceled')}>
                        Marquer comme annulée
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MaintenanceCalendarTable;
