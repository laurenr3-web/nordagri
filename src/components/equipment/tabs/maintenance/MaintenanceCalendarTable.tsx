
import React from 'react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertCircle, CheckCircle, Clock, MoreHorizontal, XCircle, FileText } from 'lucide-react';

interface MaintenanceCalendarTableProps {
  tasks: MaintenanceTask[];
  loading: boolean;
  formatDate: (date: Date) => string;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityColor: (priority: string) => string;
  handleViewQuote: (taskId: number) => void;
  handleChangeStatus: (taskId: number, status: string) => void;
  handleAddTask: () => void;
  handleCompleteTask?: (taskId: number) => void;
}

const MaintenanceCalendarTable: React.FC<MaintenanceCalendarTableProps> = ({
  tasks,
  loading,
  formatDate,
  getStatusBadge,
  getPriorityColor,
  handleViewQuote,
  handleChangeStatus,
  handleAddTask,
  handleCompleteTask
}) => {
  // Trier les tâches par date d'échéance
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="bg-secondary/20 rounded-full p-3 inline-block mb-4">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Aucune tâche planifiée</h3>
        <p className="text-muted-foreground mb-4">
          Cet équipement n'a pas de tâches de maintenance planifiées.
        </p>
        <Button onClick={handleAddTask}>
          Planifier une maintenance
        </Button>
      </div>
    );
  }
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Titre</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Priorité</TableHead>
          <TableHead>Heures</TableHead>
          <TableHead>Assignée à</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedTasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{formatDate(task.dueDate)}</TableCell>
            <TableCell>{getStatusBadge(task.status)}</TableCell>
            <TableCell>
              <div className={`px-2 py-1 rounded-full text-xs inline-flex items-center ${getPriorityColor(task.priority)}`}>
                {task.priority === 'critical' ? 'Critique' :
                 task.priority === 'high' ? 'Haute' :
                 task.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </div>
            </TableCell>
            <TableCell>{task.engineHours}</TableCell>
            <TableCell>{task.assignedTo || '-'}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewQuote(task.id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Voir le devis
                  </DropdownMenuItem>
                  
                  {task.status === 'scheduled' && (
                    <>
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in-progress')}>
                        <Clock className="h-4 w-4 mr-2" />
                        Marquer en cours
                      </DropdownMenuItem>
                      {handleCompleteTask && (
                        <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Compléter
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                  
                  {task.status === 'in-progress' && (
                    <>
                      {handleCompleteTask && (
                        <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marquer terminée
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'pending-parts')}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        En attente de pièces
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {task.status === 'pending-parts' && (
                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in-progress')}>
                      <Clock className="h-4 w-4 mr-2" />
                      Reprise des travaux
                    </DropdownMenuItem>
                  )}
                  
                  {task.status !== 'completed' && task.status !== 'cancelled' && (
                    <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'cancelled')}>
                      <XCircle className="h-4 w-4 mr-2" />
                      Annuler
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MaintenanceCalendarTable;
