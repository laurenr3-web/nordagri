
import React, { useState, useEffect, useRef } from 'react';
import { format, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import TaskDetailsDialog from '@/components/maintenance/dialogs/TaskDetailsDialog';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { getPriorityBadge } from '@/components/maintenance/MaintenanceUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MaintenanceTableProps {
  tasks: MaintenanceTask[];
  updateTaskStatus: (taskId: number, status: string) => void;
  updateTaskPriority: (taskId: number, priority: string) => void;
  deleteTask: (taskId: number) => void;
  userName?: string;
  highlightedTaskId?: number;
}

export const MaintenanceTable: React.FC<MaintenanceTableProps> = ({
  tasks,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
  userName = 'Utilisateur',
  highlightedTaskId
}) => {
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isTaskDetailsOpen, setIsTaskDetailsOpen] = useState(false);
  const highlightedRowRef = useRef<HTMLTableRowElement>(null);
  
  // Scroll to and open details for highlighted task
  useEffect(() => {
    if (highlightedTaskId) {
      const task = tasks.find(t => t.id === highlightedTaskId);
      if (task) {
        setSelectedTask(task);
        setIsTaskDetailsOpen(true);
        
        // Give time for the row to render before scrolling
        setTimeout(() => {
          if (highlightedRowRef.current) {
            highlightedRowRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
          }
        }, 100);
      }
    }
  }, [highlightedTaskId, tasks]);
  
  const getStatusBadge = (dueDate: Date, status: string) => {
    if (status === 'completed') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>Terminée</span>
        </Badge>
      );
    }
    
    if (status === 'in-progress') {
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>En cours</span>
        </Badge>
      );
    }
    
    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          <span>En retard</span>
        </Badge>
      );
    }
    
    if (isToday(dueDate)) {
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Aujourd'hui</span>
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>Planifiée</span>
      </Badge>
    );
  };
  
  return (
    <>
      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">Aucune tâche trouvée</p>
          <p className="text-xs text-muted-foreground">
            {userName}, vous n'avez pas encore de tâches dans cette catégorie.
          </p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Équipement</TableHead>
                <TableHead>Tâche</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date d'échéance</TableHead>
                <TableHead>Priorité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Assigné à</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className={`cursor-pointer hover:bg-muted/50 ${
                    task.id === highlightedTaskId ? 'bg-primary/10 border-l-4 border-primary' : ''
                  }`}
                  ref={task.id === highlightedTaskId ? highlightedRowRef : null}
                >
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                    className="font-medium"
                  >
                    {task.equipment}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {task.title}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {task.type === 'preventive' ? 'Préventive' : 
                     task.type === 'corrective' ? 'Corrective' : 
                     task.type === 'condition-based' ? 'Conditionnelle' : task.type}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {format(task.dueDate, 'dd MMM yyyy', { locale: fr })}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {getPriorityBadge(task.priority)}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {getStatusBadge(task.dueDate, task.status)}
                  </TableCell>
                  <TableCell 
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTaskDetailsOpen(true);
                    }}
                  >
                    {task.assignedTo || 'Non assigné'}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 focus-visible:ring-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedTask(task);
                            setIsTaskDetailsOpen(true);
                          }}
                        >
                          Voir les détails
                        </DropdownMenuItem>
                        {task.status !== 'completed' && (
                          <DropdownMenuItem
                            onClick={() => updateTaskStatus(task.id, 'completed')}
                          >
                            Marquer comme terminée
                          </DropdownMenuItem>
                        )}
                        {task.status === 'scheduled' && (
                          <DropdownMenuItem
                            onClick={() => updateTaskStatus(task.id, 'in-progress')}
                          >
                            Démarrer la tâche
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => deleteTask(task.id)}
                          className="text-red-600"
                        >
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <TaskDetailsDialog
        task={selectedTask}
        open={isTaskDetailsOpen}
        onOpenChange={setIsTaskDetailsOpen}
        onStatusChange={updateTaskStatus}
        onPriorityChange={updateTaskPriority}
        onDeleteTask={deleteTask}
      />
    </>
  );
};
